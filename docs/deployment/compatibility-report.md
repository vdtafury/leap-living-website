# LEAP LIVING — Phase 0 Compatibility Report

**Date:** 2026-11-08
**Author:** planning/audit assistant
**Scope:** Phase 0 hosting verification per `INFRASTRUCTURE.md` §3. No product code was written.
**Access available:** **none** to the cPanel account. No cPanel username/password, no SSH key, no API token, no database credentials. Every finding below comes from unauthenticated, public checks against `leapliving.ae` / `195.250.23.54` and from the supplied documents. Items that require the cPanel UI, a shell, or credentials are marked **UNKNOWN**.

---

## 1. Executive summary

- The live site is **WordPress on Apache** at `195.250.23.54` (reverse DNS `d3629.lon1.stableserver.net`, London), matching `INFRASTRUCTURE.md` §1.
- cPanel/WHM, SSH, FTP, SMTP and HTTPS are reachable; **MySQL (3306) is not exposed publicly** (good).
- Domain mail is **Microsoft 365** (MX), SPF is `v=spf1 include:spf.protection.outlook.com -all`, DKIM exists, **DMARC is absent**.
- **16 of the 17 checklist items are UNKNOWN** because no hosting credentials are available. Phase 0 cannot be completed, and Phase 1 must not start, until read access to the cPanel account (and a staging subdomain + database) is provided.
- A **local PoC** (`poc/`) proves the application stack on this machine (Next.js 16 + Prisma 7 + Sharp + SQLite): **14/14 verification checks pass**. It does **not** prove MySQL/MariaDB, Passenger, or the host's OS/glibc — those remain UNKNOWN.
- The proposed stack needs **Node ≥ 20.19** (Prisma 7.10.1 floor). The host's Node version is the single most important unknown.
- New brand findings: the brand guidelines specify **Sony Sketch EF** for headlines (an obscure free-for-personal-use font, licence unknown) and **Poppins** for body; exact colours are now confirmed; Mission/Vision wording in the brand PDF differs from the company profile.

---

## 2. INFRASTRUCTURE.md §3 checklist

| # | Check | Result | Evidence / notes |
|---|---|---|---|
| 1 | Available Node.js versions in Setup Node.js App | **UNKNOWN** | No cPanel login. Login page reachable at `https://195.250.23.54:2083/` but requires auth. The screenshot referenced in `INFRASTRUCTURE.md` §1 is not in the repo. |
| 2 | RAM / CPU / process / inode limits | **UNKNOWN** | No cPanel "Resource Usage" access. |
| 3 | MySQL/MariaDB version, charset/collation, max connections | **UNKNOWN** | Port 3306 closed to the public; no DB credentials. |
| 4 | Can the app connect to the DB from Node? | **UNKNOWN** | Depends on 1–3. |
| 5 | Prisma generate + migrate deploy works | **UNKNOWN** | Depends on 1–3. Engine target (OS/glibc) unverified. **Local PoC: PASS** on SQLite (§8). |
| 6 | Sharp installs and runs (resize a JPEG) | **UNKNOWN** | No Node runtime on the host available. Local dev host has Node 24.22.2; Sharp 0.35.5 requires Node ≥ 20.9. **Local PoC: PASS** (800×600 → 320×240, §8). |
| 7 | Minimal Next.js standalone starts under Passenger and survives restart | **UNKNOWN** | No staging subdomain exists; no Node app deployed. |
| 8 | Env vars loaded correctly; secrets not exposed | **UNKNOWN** | No app deployed. **Local PoC: PASS** (`.env` loaded via `prisma.config.ts`, §8). |
| 9 | Persistent writable storage outside the document root; survives redeploy | **UNKNOWN** | No app/deploy. |
| 10 | File upload + read-back through the controlled route | **UNKNOWN** | No app/deploy. **Local PoC: PASS** (upload, magic-byte validation, media read-back, §8). |
| 11 | SMTP: send via the host's mail server; note limits, SPF/DKIM/DMARC | **UNKNOWN** (partial evidence) | MX = `leapliving-ae.mail.protection.outlook.com`; SPF `v=spf1 include:spf.protection.outlook.com -all`; DKIM `selector1-leapliving-ae._domainkey...` present; **no DMARC** at `_dmarc.leapliving.ae`. Host runs Exim 4.100.1 on ports 25/587. No send test possible without credentials. **Sending From @leapliving.ae via host SMTP will fail SPF/DKIM** (see §5). |
| 12 | Cron: run a job every N minutes | **UNKNOWN** | No cPanel access. |
| 13 | SSH/Terminal available; Git available | **UNKNOWN** (partial evidence) | SSH port 22 open, banner `SSH-2.0-OpenSSH_8.0`. No credentials/keys, so shell and Git are unverified. cPanel Terminal existence not verified (screenshot not in repo). |
| 14 | Health endpoint reachable; HTTPS valid on staging subdomain | **UNKNOWN** (partial evidence) | Production HTTPS valid: Let's Encrypt, CN `leapliving.ae`, SAN `leapliving.ae` + `www.leapliving.ae`, expires 2027-01-27. No app health endpoint. `staging/stage/dev/app.leapliving.ae` all NXDOMAIN. **Local PoC: `/api/health` PASS** (§8). |
| 15 | Backup: DB and `storage/` backed up and restored | **UNKNOWN** | No cPanel/Backuply access. |
| 16 | Rollback: switch app root back to previous release | **UNKNOWN** | No releases exist. |
| 17 | Response time for a trivial page (informational) | **PASS** | From this host (Europe): DNS 5 ms, connect 162 ms, TLS 371 ms, TTFB 574 ms, total 764 ms, HTTP 200. UAE latency is not measurable from this host. |

**Totals: PASS 1 · UNKNOWN 16 · FAIL 0.**

---

## 3. Public hosting facts (evidence)

### 3.1 DNS and identity

```
leapliving.ae            A     195.250.23.54
195.250.23.54            PTR   d3629.lon1.stableserver.net
leapliving.ae            NS    ns3.tasjeel.ae (192.250.230.45)
leapliving.ae            NS    ns4.tasjeel.ae (192.250.224.90)
leapliving.ae            MX    0 leapliving-ae.mail.protection.outlook.com
leapliving.ae            TXT   v=spf1 include:spf.protection.outlook.com -all
leapliving.ae            TXT   MS=ms37243970
_dmarc.leapliving.ae     TXT   (none)
```

### 3.2 Open ports (unauthenticated TCP probe)

| Port | Service | Evidence |
|---|---|---|
| 21 | FTP | `Pure-FTPd [privsep] [TLS]`, banner says "user number 1 of 50 allowed" |
| 22 | SSH | `SSH-2.0-OpenSSH_8.0` |
| 25 | SMTP | Exim 4.100.1 (`d3629.lon1.stableserver.net`) |
| 80 / 443 | HTTP / HTTPS | Apache, HTTP/2, WordPress |
| 465 / 587 | SMTPS / submission | open |
| 993 / 995 | IMAPS / POP3S | open |
| 2083 / 2087 / 2096 | cPanel / WHM / webmail | login pages reachable |
| 3306 | MySQL | **closed/filtered** (good) |

### 3.3 Production site

```
HTTP/2 200
server: Apache
cache-control: no-cache
wpo-cache-status: cached        (WP Rocket)
last-modified: Sat, 07 Nov 2026 19:03:33 GMT
<title>Leap Living</title>
wp-content paths present
```

TLS: `CN=leapliving.ae`, issuer Let's Encrypt (YR2), valid 2026-10-29 → 2027-01-27, SAN `leapliving.ae`, `www.leapliving.ae`.

### 3.4 cPanel version

Not exposed publicly. The login page is `cPanel Login`, copyright 2026, with magic-revision assets; no version string was retrievable. **UNKNOWN.**

---

## 4. Proposed pinned stack (pending host verification)

All versions below are the latest stable releases on the npm registry as of 2026-11-08, except where noted. **These are proposals, not decisions** — `DECISIONS.md` must record the final choice after the host is verified.

| Area | Proposed pin | Notes / host constraint |
|---|---|---|
| Node.js | **22 LTS** (or 24.x) | Floor is **≥ 20.19** because Prisma 7.10.1 requires `^20.19 \|\| ^22.12 \|\| >=24.0`. Next.js 16 requires `>=20.9.0`; Sharp 0.35.5 requires `>=20.9.0`. **Verify what Tasjeel's Node selector offers before committing.** |
| Framework | **next 16.4.5** | App Router. If the host can only provide Node 18.18+, fall back to **next 15.5.29** (`^18.18.0 \|\| ^19.8.0 \|\| >=20.0.0`). |
| React | **react 19.3.1 / react-dom 19.3.1** | Next 16 peer range allows React 19. |
| TypeScript | **typescript 5.9.3** | TS 7.0.2 is the npm `latest` but is brand new (native port); verify Next 16 support and wait for stability before adopting. |
| Styling | **tailwindcss 4.3.5** | v4, CSS-first config. |
| ORM | **prisma 7.10.1** and **@prisma/client 7.10.1** | **Do not use `prisma@8.0.0-rc.33`** — the npm `latest` tag currently points at a release candidate. `@prisma/client@latest` is 7.10.1. Prisma 7 needs `prisma.config.ts` (already anticipated in `ARCHITECTURE.md`). |
| Images | **sharp 0.35.5** | Native module; must match the host OS/glibc. Fallback if it fails: pre-generate variants off-server, or use a pure-JS decoder. |
| Validation | **zod 4.6.7** | |
| Forms | **react-hook-form 7.91.0** | |
| Tables | **@tanstack/react-table 9.3.1** | |
| Email | **nodemailer 10.4.0** | Through the `EmailOutbox`; SMTP path must be decided (see §5). |
| Logging | **pino 10.4.0** | JSON to `storage/logs`. |
| Auth | **better-auth 1.7.18** *or* custom sessions | Pending **O-12**. Do not start Phase 1 without a decision. |
| Tests | **vitest 5.1.0**, **@playwright/test 1.65.0** | |
| UI primitives | **@radix-ui/react-dialog 1.3.1** and other Radix primitives | Pin each package exactly at scaffold time. |
| Icons | **lucide-react 1.70.0** | |
| Motion | **motion 14.10.1** | Use sparingly. |
| Lint | **eslint 10.14.0** | Verify compatibility with Next 16's lint setup at scaffold time. |

### Fallback stack if the host cannot provide Node ≥ 20.19

| Area | Fallback |
|---|---|
| Node | 18.18+ (only if that is all the host offers) |
| Next.js | 15.5.29 |
| Prisma | 6.19.3 (CLI + client) |
| Sharp | 0.33.5 (`^18.17.0 \|\| ^20.3.0 \|\| >=21.0.0`) |

If the host cannot provide Node ≥ 18.18 at all, **stop and report** — the stack cannot run and a small VPS must be proposed instead.

---

## 5. Blockers and missing information

1. **No hosting credentials.** cPanel login, SSH key, or API token is required to verify items 1–10, 12–13 and 15–16.
2. **No staging subdomain.** `O-16` is unanswered; no candidate resolves. Item 7 and 14 cannot be tested.
3. **No database credentials / engine confirmation.** Item 3–5 cannot be tested.
4. **SMTP path undecided.** The domain's mail is M365 and SPF is `-all` for M365 only. Sending From `@leapliving.ae` through the host's Exim will fail SPF and DKIM. Options: (a) use M365 SMTP with client credentials, (b) configure SPF/DKIM/DMARC to include the host and send via Exim, or (c) use a relay. **No DMARC record exists.** This must be decided before any email feature.
5. **Build location undecided.** `P-01` (off-server build + upload) is preferred but depends on memory limits (item 2) and on whether the Node app root can be repointed (item 16).
6. **Brand asset gaps.** No logo SVG/AI, no confirmed brand font licence (see §6), no AI homepage mock-up file, no Figma export.
7. **Repo layout is duplicated and has no git repository** (see §6, C-15).

---

## 6. New contradictions and missing information (beyond DECISIONS.md)

These are recorded in `DECISIONS.md` section D (contradictions) and section C (open questions).

| ID | Type | Finding |
|---|---|---|
| C-13 | Contradiction | **Mission/Vision wording differs** between `BRAND_GUIDELINES.pdf` and `Company + CEO Profile.pdf` / `client-content.md`. The brand PDF says Mission: "…through well-informed real estate decisions, backed by deep market understanding and experience…" and Vision: "To build a globally respected real estate advisory from the Middle East…". The company profile says Mission: "…experience-driven real estate advisory; grounded in long-term value…" and Vision: "To be a globally respected real estate consultancy…". Client must confirm which is official. |
| C-14 | Contradiction | **Headline font.** The brand guidelines specify **Sony Sketch EF** for headlines and **Poppins** for body. Sony Sketch EF is a real but obscure font (Diezil, 2008, "unknown licence", free for personal use), which conflicts with the premium brand positioning and creates a licensing risk. `DESIGN_SYSTEM.md` §4 only mentioned Poppins and called the guidelines' title font "a different geometric sans" (unconfirmed). Part of **O-02**. |
| C-15 | Contradiction / missing | **Repo layout.** The working directory contains flat copies of all root docs plus a nested `leap-living-root-files/leap-living/` tree that matches the documented structure (`docs/business`, `docs/source-materials`). There is **no `.git` directory**, so `AGENTS.md` §8 git conventions cannot be applied. `docs/source-materials/` and `docs/business/client-content.md` exist only in the nested tree. A stale copy of the source-materials README also exists under `mnt/user-data/outputs/leap-living/docs/source-materials/`, and `leap-living-root-files.zip` sits in the working tree. Consolidate before Phase 1. |
| C-16 | Missing | **Source-material index is wrong.** `docs/source-materials/README.md` lists `homepage-mockup-AI-reference.png` and `cpanel-tools-screenshot.png` as expected, but neither is present. It refers to `Company_CEO_Profile.pdf` while the actual file is `Company + CEO Profile.pdf`. The supplied logo PNG and `leap-living-website-overview.pdf` are not listed. |
| C-17 | Contradiction | **Colour values.** Actual brand PDF swatches: teal 100% `#3B9EA1`, 75% `#6CB6B8`, 50% `#9CCECF`, 25% `#CDE6E7`, 10% `#EBF5F5`; grey 100% `#DDDDDD`, 75% `#E5E5E5`, 50% `#EDEDED`, 25% `#F6F6F6`, 10% `#FBFBFB`. `DESIGN_SYSTEM.md` §3 lists 50% `#9DCFD0`, 25% `#CEE7E8`, 10% `#EBF5F6` — close but not exact. The supplied logo PNG is light grey `#DDDEDF` on transparency, not the teal/white variants described. |
| C-18 | Risk | **Brand collateral carries SAMPLE data.** The letterhead and email signature in the brand PDF show "Ethan Walker, Sales Director", "+971 50 456 7890", "+971 4 123 4567", "ethan@leap.ae", and "Office 1204, 12th Floor, Al Saqr Business Tower, Sheikh Zayed Road, Dubai, UAE". `PROJECT_CONTEXT.md` marks these as SAMPLE, but the address now appears in official brand collateral, so **O-04** must be resolved before any use. |
| C-19 | Missing | **Mail authentication.** No DMARC record for `leapliving.ae`; SPF is `-all` and includes only M365. Host SMTP cannot authenticated-send From `@leapliving.ae`. New open question **O-19**. |
| O-20 | Missing | **cPanel/WHM version and CloudLinux Node.js Selector versions** are not recorded anywhere and are not publicly exposed. Needed to pin Node/Next/Prisma. |

Additional notes:

- The brand PDF also contains a **Brand Story** ("Leap Living: Experience That Shapes Better Decisions") and a **Tone of Voice** page ("Grounded, not persuasive; Clear, not complex; Reassuring, not indulgent; Thoughtful, not transactional", plus "Say this / not that" examples). This copy is not in `client-content.md` and would need approval before use.
- `leap-living-website-overview.pdf` is a 1-page summary of the 6 public pages and repeats the unapproved hero "Unlock your next move" — consistent with **C-03** and **O-01**.
- The brand PDF defines **four logo lockups** (Primary, Horizontal, Brand Mark, Word Mark); only one PNG (grey-on-transparent) is supplied.

---

## 7. Recommendations

1. **Do not start Phase 1** until checklist items 1, 3, 5 and 7 are PASS.
2. Obtain cPanel credentials (or API token), a staging subdomain, and DB credentials; then re-run this checklist.
3. Decide the SMTP path and add DMARC before any email feature.
4. Pin Node to a version the host actually offers; prefer off-server build + standalone upload.
5. Consolidate the duplicated repo layout and initialise git before scaffolding.
6. Resolve the brand questions (O-01, O-02, O-04) before designing the public site.

---

## 8. Local PoC results (2026-11-10)

**Scope:** minimal Next.js + Prisma + local database, health endpoint, file upload, media read-back, Sharp resize. No business features. Code: `poc/`.

**Environment:** Ubuntu 24.04.5 LTS, x86_64, glibc 2.39, Node v24.22.2, npm 11.19.1, 4 cores, 6.8 GB RAM, 70 GB free disk. No local MySQL and no Docker; no passwordless sudo, so a system MariaDB install was not possible. The PoC therefore uses **SQLite** through Prisma's driver adapter. This proves the application stack locally; it does **not** prove MySQL/MariaDB behaviour on the host.

**Stack verified locally:**

| Package | Version | Result |
|---|---|---|
| next | 16.4.5 | `next build` PASS (Turbopack) |
| react / react-dom | 19.3.1 | build PASS |
| typescript | 5.9.3 | `tsc --noEmit` PASS |
| prisma / @prisma/client | 7.10.1 | migrate + generate PASS |
| @prisma/adapter-better-sqlite3 | 7.10.1 | working |
| better-sqlite3 | 12.11.1 | native module built and working |
| sharp | 0.35.5 | 800×600 → 320×240 resize PASS |
| zod | 4.6.7 | boundary validation PASS |

**Verification: 14/14 PASS** (`poc/scripts/verify.sh`): health endpoint (DB up), upload JPEG (201), media read-back (JPEG), Sharp resize (320px), reject PNG-as-JPEG (415), reject non-image (415), reject oversize (413), reject path traversal (404), homepage render.

**Migration artifact:** `poc/prisma/migrations/20261110030639_init/migration.sql` creates `MediaAsset` with a unique index on `filename` and an index on `createdAt`.

**What this does and does not prove:**

- **Proves:** Next.js 16 + Prisma 7 + Sharp + SQLite runs on Node 24 / Ubuntu 24.04; migrations apply; uploads validate and persist; images resize.
- **Does not prove:** MySQL/MariaDB compatibility, the Passenger/CloudLinux runtime, native modules on the host's OS/glibc, resource limits, cron, SMTP, backups, rollback. Those remain UNKNOWN (§2).
- **glibc note:** the local build links native modules against glibc 2.39. The host's glibc is unknown; if it is older, a locally built `node_modules` may not load. The off-server build plan (P-01) must either build in a container matching the host or install dependencies on the host.

**Reproduce:**

```bash
cd poc
npm install
npm run build
PORT=3001 npm run start
BASE=http://localhost:3001 ./scripts/verify.sh
```

---

## Appendix — evidence commands

```bash
# DNS
dig +short A leapliving.ae
dig +short NS leapliving.ae
dig +short MX leapliving.ae
dig +short TXT leapliving.ae
dig +short TXT _dmarc.leapliving.ae
getent hosts 195.250.23.54

# Ports
for p in 21 22 25 80 443 465 587 993 995 2083 2087 2096 3306; do
  timeout 4 bash -c "cat < /dev/null > /dev/tcp/195.250.23.54/$p" && echo "OPEN $p" || echo "closed $p"
done

# Banners
nc -w 5 195.250.23.54 22 < /dev/null   # SSH-2.0-OpenSSH_8.0
nc -w 5 195.250.23.54 21 < /dev/null   # Pure-FTPd
nc -w 5 195.250.23.54 587 < /dev/null  # Exim 4.100.1

# TLS
echo | openssl s_client -connect leapliving.ae:443 -servername leapliving.ae | openssl x509 -noout -subject -issuer -dates -ext subjectAltName

# HTTP / timing
curl -sS -o /dev/null -D - https://leapliving.ae/
curl -sS -o /dev/null -w 'dns=%{time_namelookup}s connect=%{time_connect}s tls=%{time_appconnect}s ttfb=%{time_starttransfer}s total=%{time_total}s http=%{http_code}\n' https://leapliving.ae/

# npm pins
npm view next version && npm view react version && npm view prisma dist-tags --json
npm view @prisma/client version && npm view sharp version && npm view zod version
# etc.
```
