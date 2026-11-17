# cPanel staging deployment (Setup Node.js App)

Staging runs on **`staging.leapliving.ae`** on the client's Tasjeel cPanel account (user `leaplivi`). The live WordPress site in `public_html` is **not touched**.

## Facts observed on the host

| Date | Fact | Source |
|---|---|---|
| 2026-11-16 | Setup Node.js App offers Node 6.17 → 24.22.3; **22.23.5 is the default ("recommended")** | cPanel screenshot (owner) |
| 2026-11-16 | Home directory `/home/leaplivi` | Passenger log hint in the same screen |
| pending | OS / glibc (`cat /etc/redhat-release; ldd --version`), compilers, resource limits | owner to run in cPanel Terminal |

## 1. Package (on a Linux x86_64 machine with Node 22)

```bash
cd web
npm ci
bash scripts/deployment/package-cpanel.sh
```

The script does the following:
- builds the standalone bundle;
- rebuilds `better-sqlite3` so it only needs **glibc 2.28** (CloudLinux 8+), using `scripts/deployment/glibc-compat/`;
- creates an empty database; the smoke test's first `/api/health` request creates the tables (`src/server/schema.ts`, the same statements run on any server that starts without them);
- smoke-tests health, home, a ranged (206) request for the hero video, and that the `MediaAsset` and `Inquiry` tables exist;
- writes two archives to `web/deploy-out/`.

| Archive | Extract in | When |
|---|---|---|
| `leapliving-app-<stamp>.zip` | `/home/leaplivi/` → `leapliving-app/app/…` | every deploy |
| `leapliving-data-initial.zip` | `/home/leaplivi/` → `leapliving-data/leapliving.db` | **first deploy only**. Never extract it over a live database |

### The client's hero video (~150 MB, required)

The homepage plays **one** video: the client's original file exactly as delivered (owner decision 2026-11-17: no lighter or re-encoded versions, no trimming). It is not in the repository, because GitHub rejects files over 100 MB, so it has to be placed on the machine that builds the zip **before** running `package-cpanel.sh`:

```bash
cd web
bash scripts/prepare-hero-original.sh "/path/to/Website Video 1.mp4"
git add public/images src/data/image-manifest.json && git commit -m "chore(hero): poster from the original video"
bash scripts/deployment/package-cpanel.sh
```

`prepare-hero-original.sh` makes no re-encode. It does the following:
- copies the video stream bit for bit and drops the audio;
- moves the index to the front (faststart), so playback starts before the download ends;
- cuts the poster from frame 0 and rebuilds the WebP variants.

It refuses files that browsers cannot play everywhere (anything but H.264 8-bit 4:2:0). `package-cpanel.sh` stops if the file is missing (override with `ALLOW_NO_HERO_VIDEO=1`, poster only) or not faststart.

Who sees the video (`src/lib/hero-video.ts`):
- **Plays:** any screen size, unless one of the rules below applies. The file streams at ~16 Mbps.
- **Poster only (frame 0, same picture):** Save-Data on, Chrome reporting 2G/3G, Chrome reporting under 10 Mbps (Chrome caps the value at 10 and adds ±10% privacy noise, so 9–10 counts as 10), or reduced-motion. Safari and Firefox report no speed, so they play it.

Each visit that plays the video can download up to the full ~150 MB, so check the hosting bandwidth quota.

## 2. One-time cPanel setup

1. **Domains → Create A New Domain:** `staging.leapliving.ae`. Untick *Share document root*; document root `/home/leaplivi/staging.leapliving.ae`, outside `public_html`.
2. **SSL/TLS Status → Run AutoSSL** for the subdomain.
3. **Directory Privacy:** password-protect `/home/leaplivi/staging.leapliving.ae`. Staging must not be public. It is also kept out of search engines by default: without `SITE_INDEXING=true` every response carries `X-Robots-Tag: noindex` and robots.txt disallows everything.
4. **Setup Node.js App → Create:**

| Field | Value |
|---|---|
| Node.js version | **22.23.5** (must stay on 22.x: native modules are built for Node 22) |
| Application mode | Production |
| Application root | `leapliving-app` |
| Application URL | `staging.leapliving.ae` |
| Application startup file | `app/server.js` |
| Passenger log file | `/home/leaplivi/logs/leapliving-staging.log` |

Environment variables:

| Name | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `file:/home/leaplivi/leapliving-data/leapliving.db` |
| `STORAGE_DIR` | `/home/leaplivi/leapliving-data/storage` |
| `SITE_URL` | `https://staging.leapliving.ae` |
| `ADMIN_USER` | an admin username (needed to read form submissions) |
| `ADMIN_PASSWORD` | at least 12 characters; keep it out of chat and the repository |

Do **not** set `SITE_INDEXING` on staging. Do **not** set `ALLOW_FRAMING` anywhere on the host.

Form submissions are stored in the `Inquiry` table. Export them with
`curl -u "$ADMIN_USER:$ADMIN_PASSWORD" "https://staging.leapliving.ae/api/inquiries?format=csv" -o inquiries.csv` (opens in Excel; UTF-8 with BOM, formula-safe cells). Through the browser, staging's Directory Privacy prompt comes first, then the admin prompt.

**Do not press "Run NPM Install".** The bundle already contains its `node_modules`, one level down in `app/`, so it does not clash with CloudLinux's own `node_modules` symlink in the application root.

## 3. Deploy / update

1. **File Manager:** upload the app zip to `/home/leaplivi/` and extract it, replacing `leapliving-app/`. On the first deploy, also upload and extract the data zip.
2. **Setup Node.js App → Restart.**
3. Check `https://staging.leapliving.ae/` and `https://staging.leapliving.ae/api/health`, which should report `"db":"up"`.

Rollback: keep the previous app zip, extract it again, then Restart. Data in `leapliving-data/` is never inside the app folder, so it survives both.

## 4. Troubleshooting

| Symptom | Check |
|---|---|
| 503 / "Incomplete response" | Passenger log file above; startup file must be `app/server.js` |
| `GLIBC_2.xx not found` | Host older than glibc 2.28. Send `ldd --version` output; rebuild per host |
| `NODE_MODULE_VERSION` mismatch | App not on Node 22.x |
| `DATABASE_URL is not set` | Env var missing in the Node.js app screen; Restart after editing |
| Health `db: down` | `leapliving-data/` missing or not writable by the account (details go to the Passenger log only, never to the response) |
| `/api/inquiries` GET returns 404 | `ADMIN_USER` / `ADMIN_PASSWORD` not set, or the password is under 12 characters; Restart after editing |

## 5. Production cut-over (later, explicit written approval only)

1. Run a full **Backuply** backup of the WordPress site, covering files and database.
2. Point the Node.js app's URL at `leapliving.ae` and configure `www`. The certificate already exists.
3. Keep WordPress restorable until the new site has been verified live.
4. Before cut-over:
   - set `SITE_URL=https://leapliving.ae` and `SITE_INDEXING=true` (only on production);
   - forms already persist (2026-11-17); email notification is still open (O-19, CRM link to be decided);
   - done 2026-11-17: `/api/upload` and `/api/sharp` require admin auth, security headers are on, the homepage debug DB line is gone.
