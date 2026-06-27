# vaayulabs Landing Page

Hono static server + Telegram form submission. Auto-deploys via Docker on push to `main`.

---

## How It Works

```
GitHub Actions (CI runner)
  → builds Docker image from source code
  → pushes image to ghcr.io/ranktalkapp-ai/landing-page

VPS (Contabo)
  → pulls the pre-built image from ghcr.io
  → runs it as a container
```

The VPS **never needs the source code**. Docker packages everything (Node, server.js, index.html) into the image at build time. The only files on the VPS are:

```
/var/www/landing-page/
  docker-compose.yml   ← copied automatically by CI on every deploy
  .env                 ← created manually once (holds your secrets)
```

No git, no Node, no npm install on the server.

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

# 2. Create the app directory
mkdir -p /var/www/landing-page
cd /var/www/landing-page

# 3. Create .env with your secrets
cat > .env <<'EOF'
TELEGRAM_BOT_TOKEN=your_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
PORT=3000
EOF
```

After the first CI run, the container starts automatically. That's all the server needs.

---

## CI/CD (GitHub Actions)

On every push to `main`:
1. Builds Docker image from source
2. Pushes to `ghcr.io/ranktalkapp-ai/landing-page:latest`
3. SCPs `docker-compose.yml` to the VPS
4. SSHs into VPS → pulls new image → restarts container

**GitHub Secrets to add** → Repo → Settings → Secrets → Actions:

| Secret | Value |
|--------|-------|
| `VPS_HOST` | Contabo server IP |
| `VPS_USER` | `root` or SSH user |
| `VPS_SSH_KEY` | contents of `~/.ssh/github_actions` private key |

`GITHUB_TOKEN` is automatic — no setup needed.

**SSH key setup (one-time):**
```bash
# On your local machine — generate deploy key
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions -N ""

# Add public key to VPS authorized_keys
cat ~/.ssh/github_actions.pub | ssh root@YOUR_VPS_IP "cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"

# Copy private key into GitHub secret VPS_SSH_KEY
cat ~/.ssh/github_actions
```

---

## Telegram Bot Setup

1. Message `@BotFather` → `/newbot` → copy **token**
2. Message `@userinfobot` → copy your **chat ID**
3. Paste both into `.env` on the server
