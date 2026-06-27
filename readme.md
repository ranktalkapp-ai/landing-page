# vaayulabs Landing Page

Hono static server + Telegram form submission. Auto-deploys via Docker on push to `main`.

---

## Local Dev

```bash
cp .env.example .env
# fill in TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID

npm install
npm run dev       # http://localhost:3000
```

## Docker (local)

```bash
docker build -t vaayulabs-site .
docker run -p 3000:3000 --env-file .env vaayulabs-site
```

---

## VPS — One-Time Setup (Contabo)

```bash
# 1. Install Docker + Compose plugin
curl -fsSL https://get.docker.com | sh
apt install docker-compose-plugin -y

# 2. Clone repo
git clone https://github.com/ranktalkapp-ai/landing-page /var/www/landing-page
cd /var/www/landing-page

# 3. Create env file
cp .env.example .env
nano .env   # paste TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID

# 4. Set your GitHub repo in env so docker-compose resolves the image
echo 'GITHUB_REPO=ranktalkapp-ai/landing-page' >> .env

# 5. First pull & start (after first CI run builds the image)
docker compose pull
docker compose up -d
```

---

## CI/CD (GitHub Actions)

On every push to `main`:
1. Builds Docker image → pushes to `ghcr.io`
2. SSHs into VPS → pulls new image → restarts container

**GitHub Secrets to add** → Repo → Settings → Secrets → Actions:

| Secret | Value |
|--------|-------|
| `VPS_HOST` | Contabo server IP |
| `VPS_USER` | `root` or SSH user |
| `VPS_SSH_KEY` | contents of `~/.ssh/id_rsa` private key |

`GITHUB_TOKEN` is automatic — no setup needed.

---

## Telegram Bot Setup

1. Message `@BotFather` → `/newbot` → copy **token**
2. Message `@userinfobot` → copy your **chat ID**
3. Paste both into `.env` on the server
