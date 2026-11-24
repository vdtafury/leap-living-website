# cPanel staging deployment (Setup Node.js App)

Staging runs on **`staging.leapliving.ae`** on the client's Tasjeel cPanel account (user `leaplivi`). The live WordPress site in `public_html` is **not touched**.

## Facts verified on the host

| Date | Fact | Source |
|---|---|---|
| 2026-11-16 | Setup Node.js App offers Node 6.17 → 24.22.3; **22.23.5 is the default ("recommended")** | cPanel screenshot (owner) |
| 2026-11-16 | Home directory `/home/leaplivi` (`/home/leaplivi/logs` already exists) | cPanel screenshot + Terminal |
| 2026-11-24 | OS / kernel: **CloudLinux 8** (`4.18.0-553.171.1.lve.el8.x86_64`), **glibc 2.28** (`ldd (GNU libc) 2.28`) | cPanel Terminal (`uname -a; ldd --version`) |
| 2026-11-24 | Tools present: `/bin/mysql`, `/bin/mariadb`, `/usr/local/cpanel/3rdparty/lib/path-bin/git`, `/bin/gcc`, `/bin/python3` | cPanel Terminal |

## 1. Build the Linux x86_64 bundle

Native modules (`better-sqlite3`, `sharp`, `@node-rs/argon2`) must be built for **Linux x86_64, glibc ≤ 2.28** and the exact Node major version selected in cPanel (**Node 22**, matching `22.23.5`).

### Option A — GitHub Actions (recommended on macOS / Windows)

1. Open GitHub → **Actions** → **Package cPanel bundle** → **Run workflow**.
2. Keep the staging defaults:
   - `site_url`: `https://staging.leapliving.ae`
   - `site_indexing`: `false` (workflow refuses `true` for staging URLs)
   - `node_version`: `22`
3. Download the `cpanel-bundle-node22` artifact containing the two zip archives below.

### Option B — Local Linux x86_64 (or Docker `--platform linux/amd64`)

```bash
cd web
npm ci
SITE_URL=https://staging.leapliving.ae bash scripts/deployment/package-cpanel.sh
```

What `package-cpanel.sh` verifies before zipping:
- builds the Next.js standalone bundle;
- rebuilds `better-sqlite3` with `scripts/deployment/glibc-compat/` so it needs **glibc ≤ 2.28**;
- verifies every `.node` native binary in the bundle (`better-sqlite3`, `sharp`, `@node-rs/argon2`) needs **glibc ≤ 2.28** and runs real smoke calls (SQLite query, Sharp WebP encode, Argon2id hash/verify);
- boots the standalone server and verifies `/api/health` (`"db":"up"`), `/`, `/buy`, `/account/sign-in`, `/admin` redirect guard, optional hero video HTTP 206, and all 21 SQLite tables;
- writes two archives to `web/deploy-out/`:

| Archive | Extract in | When |
|---|---|---|
| `leapliving-app-<stamp>.zip` | `/home/leaplivi/` → `leapliving-app/app/…` | every deploy |
| `leapliving-data-initial.zip` | `/home/leaplivi/` → `leapliving-data/leapliving.db` | **first deploy only**. Never extract it over a live database |

### The client's hero video (~44–150 MB, git-ignored)

The homepage plays one video (`public/videos/hero/client-hero-original.mp4`), which is git-ignored because of GitHub's 100 MB limit.

- **With Option A (GitHub Actions):** the bundle is built with `ALLOW_NO_HERO_VIDEO=1` (poster works immediately). To enable the video on staging without re-uploading it on every deploy, upload the prepared `client-hero-original.mp4` **once** to `/home/leaplivi/leapliving-data/client-hero-original.mp4` via File Manager, then link it in cPanel Terminal after each app deploy:
  ```bash
  mkdir -p ~/leapliving-app/app/public/videos/hero
  ln -sf ~/leapliving-data/client-hero-original.mp4 ~/leapliving-app/app/public/videos/hero/client-hero-original.mp4
  ```
- **With Option B (local Linux):** run `bash scripts/prepare-hero-original.sh "/path/to/Website Video 1.mp4"` before `package-cpanel.sh` to bake it directly into the app zip.

## 2. One-time cPanel setup

1. **Domains → Create A New Domain:** `staging.leapliving.ae`. Untick *Share document root*; document root `/home/leaplivi/staging.leapliving.ae`, outside `public_html`.
2. **SSL/TLS Status → Run AutoSSL** for `staging.leapliving.ae`.
3. **Directory Privacy:** password-protect `/home/leaplivi/staging.leapliving.ae` so staging is not public. Without `SITE_INDEXING=true`, every response also sends `X-Robots-Tag: noindex, nofollow` and `robots.txt` disallows everything.
4. **Setup Node.js App → Create:**

| Field | Value |
|---|---|
| Node.js version | **22.23.5** (must match `node_version` used to build the zip) |
| Application mode | Production |
| Application root | `leapliving-app` |
| Application URL | `staging.leapliving.ae` |
| Application startup file | `app/server.js` |
| Passenger log file | `/home/leaplivi/logs/leapliving-staging.log` |

Environment variables (set in the Setup Node.js App screen):

| Name | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `file:/home/leaplivi/leapliving-data/leapliving.db` |
| `STORAGE_DIR` | `/home/leaplivi/leapliving-data/storage` |
| `SITE_URL` | `https://staging.leapliving.ae` |
| `ADMIN_USER` | First Super Admin username (3–40 chars, letters/digits/`._-`, **no `@`** per D-41) |
| `ADMIN_PASSWORD` | Temporary password, ≥ 12 chars, must not contain `ADMIN_USER` (forced change on first sign-in) |
| `IP_HASH_SECRET` | Long random string (32+ chars) for keyed IP hashing on form submissions |

Optional (add once O-19 SMTP credentials are ready): `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`, `MAIL_TO`.

Do **not** set `SITE_INDEXING=true` on staging. Do **not** set `ALLOW_FRAMING=1` anywhere on the host.

**Do not press "Run NPM Install".** The bundle already contains its `node_modules` one level down in `app/`, avoiding any clash with CloudLinux's own `node_modules` symlink in the application root.

## 3. Deploy / update

1. **File Manager:** upload `leapliving-app-<stamp>.zip` to `/home/leaplivi/` and extract it. (Before extracting an update, rename or remove the old `leapliving-app/app` so deleted files do not linger; keep `leapliving-data/` untouched.) On the **first deploy only**, also upload and extract `leapliving-data-initial.zip`.
2. If using the symlinked hero video (Option A), re-run the `ln -sf` command from §1 in cPanel Terminal.
3. **Setup Node.js App → Restart.**
4. Verify in order:
   - `https://staging.leapliving.ae/api/health` → `{"status":"ok","db":"up",...}`
   - `https://staging.leapliving.ae/` → homepage renders cleanly (check hero, developers, listings, projects, calculator, reviews)
   - `https://staging.leapliving.ae/account/sign-in` → sign in with `ADMIN_USER` / `ADMIN_PASSWORD` → forced password change → `/admin` dashboard loads
   - Test an image upload in `/admin/media` (proves `sharp` + writable `STORAGE_DIR` + `/media/[...path]` read-back)
   - Submit a test enquiry on `/contact` (proves DB write + `/admin/inquiries` + `/admin/outbox` + CSV export)
   - Check `~/logs/leapliving-staging.log` for any errors and inspect how Apache/Passenger passes `X-Forwarded-For`

Rollback: keep the previous `leapliving-app-<stamp>.zip`, extract it again, re-link the hero video if used, then Restart. Data in `/home/leaplivi/leapliving-data/` lives outside the app folder and survives every deploy and rollback.

## 4. Troubleshooting

| Symptom | Check |
|---|---|
| 503 / "Incomplete response" | Check `/home/leaplivi/logs/leapliving-staging.log`; startup file must be `app/server.js` |
| `GLIBC_2.xx not found` | Host is glibc 2.28; verify the zip was built by `package-cpanel.sh` without `SKIP_GLIBC_COMPAT=1` |
| `NODE_MODULE_VERSION` mismatch | App in Setup Node.js App is not on the same major version (`22.x`) used to build the zip |
| `DATABASE_URL is not set` | Env var missing in the Node.js app screen; Restart after editing |
| Health `db: down` | `/home/leaplivi/leapliving-data/` missing or not writable by `leaplivi` (check Passenger log) |
| Cannot sign in to `/admin` | Use `/account/sign-in` (D-41) with the `ADMIN_USER` username (not an email); `ADMIN_USER` / `ADMIN_PASSWORD` only seed when the `User` table is empty |
| Upload returns 500 | Verify `STORAGE_DIR` exists and is writable, and check Passenger log for `sharp` |

## 5. Production cut-over (later, explicit written approval only)

1. Run a full **Backuply** backup of the WordPress site, covering files and database.
2. Build a dedicated production bundle with `SITE_URL=https://leapliving.ae` and `SITE_INDEXING=true`.
3. Point the Node.js app's URL at `leapliving.ae` and configure `www`. Keep WordPress restorable until verified live.
4. Confirm before cut-over: real listings/projects/reviews (no samples), Trakheesi permit + Madmoun QR, ORN in footer, Privacy Policy + Terms pages, working SMTP (O-19), and a tested DB + `storage/` backup/restore drill.
