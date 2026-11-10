# INFRASTRUCTURE.md — LEAP LIVING

Hosting: client's existing **Tasjeel cPanel** account. No other infrastructure is assumed. The live WordPress site runs on the same account and **must not be modified** during development.

## 1. Observed (from a cPanel screenshot, 2026-11-08)

Present in the cPanel tool list:
- **Setup Node.js App** and **Application Manager** → a Node/Passenger-style app runner appears to exist (typically CloudLinux Node.js Selector; verify).
- **Terminal** → shell access likely available from the browser (SSH not confirmed).
- **Cron Jobs**
- **MultiPHP Manager**, **Select PHP Version**, MultiPHP INI Editor, PHP PEAR, Perl Modules, Setup Python App
- **Backuply** (backup tool), **WordPress Manager by Softaculous**, Softaculous Apps Installer, Sitejet Builder
- **SSL/TLS Certificates**, Manage API Tokens, Two-Factor Authentication, Virus Scanner, Hotlink/Leech Protection
- Server hostname in the status bar suggests a London data-centre node (`…lon1.stableserver.net:2083`). Not an issue by itself, but note it when judging latency for UAE visitors.

**Not visible in the screenshot (unknown, must be verified):** Databases section (MySQL/MariaDB, remote access, version), Git Version Control, SSH Access, Email accounts/SMTP details, File Manager/disk quota, resource usage (CPU, RAM, entry processes, inodes), available Node.js versions.

## 2. Likely constraints on shared/CloudLinux hosting (assumptions to test, not facts)

- Memory/CPU/process limits per account may make `next build` fail on the server. **Preferred plan:** build elsewhere (local machine or CI) with Next.js standalone output and upload the built artefact; run only `node` on the server.
- Native modules (Prisma engine, Sharp) must match the server's OS/architecture and glibc. Build/install for the correct target or fall back (e.g. skip image variants, pre-generate on upload with an alternative).
- Node apps are launched via a startup file under Passenger; env vars are set in the Node app screen, not in a shell.
- File ownership/permissions and writable paths are restricted; persistent storage must survive redeploys.
- Cron may allow only `curl`/PHP/Node commands at set intervals.
- Outbound SMTP may be limited per hour; confirm sending limits.
- Backuply coverage of the database and the `storage/` directory is unverified.

## 3. Phase 0 verification checklist

Record each item as PASS / FAIL / UNKNOWN with evidence (command output or screenshot) in `docs/deployment/compatibility-report.md`.

| # | Check | Notes |
|---|---|---|
| 1 | Available Node.js versions in Setup Node.js App | Must match Next.js/Prisma minimums |
| 2 | RAM / CPU / process / inode limits (cPanel "Resource Usage") | |
| 3 | MySQL or MariaDB version, charset/collation, max connections | Plan Prisma connection limit accordingly |
| 4 | Can the app connect to the DB from Node? | |
| 5 | Prisma: generate + migrate deploy works on the host (or from a build machine against the host DB) | Check engine target |
| 6 | Sharp installs and runs (resize a JPEG) | If not, record fallback |
| 7 | Minimal Next.js standalone app starts under Passenger and survives restart | Staging **subdomain** only |
| 8 | Env vars loaded correctly; secrets not exposed | |
| 9 | Persistent writable storage outside the document root; survives redeploy | |
| 10 | File upload + read-back through the controlled route | |
| 11 | SMTP: send via the host's mail server; note limits, SPF/DKIM/DMARC state for leapliving.ae | |
| 12 | Cron: run a job every N minutes; call script or protected endpoint | |
| 13 | SSH/Terminal available; Git available (or deploy by upload) | |
| 14 | Health endpoint reachable; HTTPS valid on staging subdomain | |
| 15 | Backup: can the DB and `storage/` be backed up and restored? Test a restore | |
| 16 | Rollback: switch app root back to the previous release | |
| 17 | Response time for a trivial page from the UAE | Informational |

If any of 1, 3, 5, 7 fails, stop and report; do not continue building on an unproven stack.

## 4. Deployment model (proposed, confirm after Phase 0)

- Environments: **local** → **staging** (subdomain on the same account) → **production** (explicit approval).
- Release structure: `releases/<timestamp>/` + a `current` pointer; shared `storage/` and env outside releases; rollback = repoint and restart. Scripts live in `scripts/deployment/`.
- Build off-server; upload the standalone bundle; run migrations in a controlled step with a DB backup taken first.
- Never overwrite WordPress files. Cut-over of the main domain happens only with a written plan and approval, keeping WordPress restorable.

## 5. Operations

- **Logs:** structured JSON under `storage/logs/{application,errors,security,jobs}`; rotate; never log secrets or personal data beyond need.
- **Health:** `/api/health` checks app + DB; no sensitive details in the response.
- **Backups:** daily DB dump + `storage/` snapshot, retention policy, off-account copy where possible (the client decides where), **restore tested** before go-live.
- **Jobs:** cPanel cron → email outbox / jobs processor (see `ARCHITECTURE.md` §9).
- **Honesty:** a single cPanel account gives no high availability, failover, or SLA. Do not promise otherwise.
- **Growth path if limits are hit:** a small VPS or managed Node host, enabled by env-driven config and the interfaces in `ARCHITECTURE.md` §7. That is a business decision, not a coding task.
