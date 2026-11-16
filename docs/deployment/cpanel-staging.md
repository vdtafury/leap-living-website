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
- creates the initial database from `scripts/deployment/schema.sql`;
- smoke-tests health, home and a hero video;
- writes two archives to `web/deploy-out/`.

| Archive | Extract in | When |
|---|---|---|
| `leapliving-app-<stamp>.zip` | `/home/leaplivi/` → `leapliving-app/app/…` | every deploy |
| `leapliving-data-initial.zip` | `/home/leaplivi/` → `leapliving-data/leapliving.db` | **first deploy only**. Never extract it over a live database |

### Optional: the client's original hero video (~150 MB)

Big screens with a fast connection can play the client's original file exactly as delivered. It is not in the repository, because GitHub rejects files over 100 MB, so it has to be placed on the machine that builds the zip **before** running `package-cpanel.sh`:

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

It refuses files that browsers cannot play everywhere (anything but H.264 8-bit 4:2:0). `package-cpanel.sh` then logs `Client original hero video included (…)`, and fails if the file is not faststart.

Who gets which file:
- **Original:** screens wider than 900 px on a fast link. Chrome must report its top speed bucket (10 Mbps); Safari and Firefox report nothing.
- **`client-hero-1280.mp4`:** slower desktop links.
- **`client-hero-854.mp4`:** phones and 3G.

If the original is missing on the server, the build falls back to the 1280 file on its own.

Each big-screen visit can download up to the full ~150 MB, so check the hosting bandwidth quota.

## 2. One-time cPanel setup

1. **Domains → Create A New Domain:** `staging.leapliving.ae`. Untick *Share document root*; document root `/home/leaplivi/staging.leapliving.ae`, outside `public_html`.
2. **SSL/TLS Status → Run AutoSSL** for the subdomain.
3. **Directory Privacy:** password-protect `/home/leaplivi/staging.leapliving.ae`. Staging must not be public or indexed, and `/api/upload` is still unauthenticated.
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
| Health `db: down` | `leapliving-data/leapliving.db` missing or not writable by the account |

## 5. Production cut-over (later, explicit written approval only)

1. Run a full **Backuply** backup of the WordPress site, covering files and database.
2. Point the Node.js app's URL at `leapliving.ae` and configure `www`. The certificate already exists.
3. Keep WordPress restorable until the new site has been verified live.
4. Before cut-over:
   - forms must persist and send email;
   - `/api/upload` must be authenticated;
   - security headers must be added;
   - the homepage debug DB line must be removed (`STATUS.md`).
