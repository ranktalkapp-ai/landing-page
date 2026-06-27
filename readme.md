# vaayulabs Landing Page

Hono static server + Telegram form submission. Auto-deploys on push to `main`.

---

## How It Works

```
git push main
  → GitHub Actions SSHs into VPS
  → git pull origin main
  → docker compose up --build
  → app restarts on port 4000
```

Source code lives on the VPS. Docker builds the image directly there — no external registry needed.

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
docker compose up --build   # http://localhost:4000
```

---

## VPS — One-Time Setup (Contabo)

```bash
# 1. Install Docker + Compose plugin
curl -fsSL https://get.docker.com | sh
apt install docker-compose-plugin git -y

# 2. Clone repo
git clone https://github.com/ranktalkapp-ai/landing-page /var/www/landing-page
cd /var/www/landing-page

# 3. Create .env
cp .env.example .env
nano .env   # paste TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID

# 4. First run
docker compose up -d --build
```

App runs at `http://YOUR_VPS_IP:4000`

---

## CI/CD (GitHub Actions)

On every push to `main`, GitHub Actions SSHs into the VPS and runs:
```
git pull → docker compose up --build -d → docker image prune
```

**GitHub Secrets to add** → Repo → Settings → Secrets → Actions:

| Secret | Value |
|--------|-------|
| `VPS_HOST` | Contabo server IP |
| `VPS_USER` | `root` or SSH user |
| `VPS_SSH_KEY` | contents of `~/.ssh/github_actions` private key |

**SSH key setup (one-time on your local machine):**
```bash
# Generate deploy key
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions -N ""

# Add public key to VPS
cat ~/.ssh/github_actions.pub | ssh root@YOUR_VPS_IP \
  "cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"

# Copy private key → paste into GitHub secret VPS_SSH_KEY
cat ~/.ssh/github_actions
```

---

## Telegram Bot Setup

1. Message `@BotFather` → `/newbot` → copy **token**
2. Message `@userinfobot` → copy your **chat ID**
3. Paste both into `.env` on the server
