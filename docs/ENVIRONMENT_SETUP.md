# VibePass Environment Variables & Setup

---

## Backend Environment Variables

Create `backend/.env`:

```bash
# === APP CONFIGURATION ===
NODE_ENV=development
PORT=3003
API_VERSION=v1

# === FRONTEND ===
FRONTEND_URL=http://localhost:3002

# === DATABASE ===
DATABASE_URL="postgresql://user:password@localhost:5432/vibepass_dev"
# For development: sqlite with file
# DATABASE_URL="file:./dev.db"

# === REDIS ===
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=""

# === JWT SECRETS ===
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_EXPIRATION="7d"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRATION="30d"

# === EMAIL / OTP ===
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="vibepass1233@gmail.com"
SMTP_PASS="ynbu fvct lvga udrz"  # App password, not main password
FROM_EMAIL="VibePass <noreply@vibepass.com>"
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6

# === RATE LIMITING ===
RATE_LIMIT_WINDOW_MS=60000  # 1 minute
RATE_LIMIT_MAX_REQUESTS=100

# === FILE UPLOADS (Future) ===
AWS_S3_BUCKET="vibepass-uploads"
AWS_S3_REGION="us-east-1"
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""

# === MONITORING & LOGGING ===
SENTRY_DSN="https://your-sentry-dsn@sentry.io/..."
LOG_LEVEL="debug"  # "debug", "info", "warn", "error"

# === WEBSOCKET ===
WS_URL="ws://localhost:3003"
SOCKET_IO_CORS_ORIGIN="http://localhost:3002"

# === MODERATION ===
CONTENT_FILTER_ENABLED=true
PROFANITY_FILTER_LEVEL="medium"  # "low", "medium", "strict"
ML_MODERATION_ENABLED=false  # For future use

# === TWILIO (Optional TURN Server) ===
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_TURN_SERVER_URL=""

# === FEATURE FLAGS ===
ENABLE_VOICE_MVP=true
ENABLE_ROOMS=true
ENABLE_THEMED_ROOMS=true
ENABLE_ANALYTICS=true
ENABLE_ADMIN_DASHBOARD=true
MAX_CONCURRENT_VOICE_CALLS=100
MAX_MESSAGE_LENGTH=5000

# === SEED DATA ===
SEED_DATA_ON_START=false
```

---

## Frontend Environment Variables

Create `frontend/.env.local`:

```bash
# === API CONFIGURATION ===
NEXT_PUBLIC_API_URL="http://localhost:3003/api/v1"
NEXT_PUBLIC_WS_URL="ws://localhost:3003"

# === ENVIRONMENT ===
NEXT_PUBLIC_ENV="development"
NEXT_PUBLIC_APP_NAME="VibePass"
NEXT_PUBLIC_APP_VERSION="0.1.0"

# === FEATURE FLAGS ===
NEXT_PUBLIC_ENABLE_VOICE=true
NEXT_PUBLIC_ENABLE_ROOMS=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=true

# === ANALYTICS (Optional) ===
NEXT_PUBLIC_GA_ID=""
NEXT_PUBLIC_AMPLITUDE_KEY=""

# === SENTRY (Error Tracking) ===
NEXT_PUBLIC_SENTRY_DSN=""

# === STRIPE (Future Payments) ===
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""

# === MEDIA SETTINGS ===
NEXT_PUBLIC_MAX_MESSAGE_LENGTH=5000
NEXT_PUBLIC_MAX_FILE_SIZE=52428800  # 50MB (future)

# === CACHE ===
NEXT_PUBLIC_CHAT_HISTORY_LIMIT=50
NEXT_PUBLIC_MATCH_POOL_REFRESH_SECONDS=300  # 5 min

# === TURN SERVERS (WebRTC) ===
NEXT_PUBLIC_TURN_SERVERS_JSON='[{"urls":["stun:stun.l.google.com:19302"]}]'
```

---

## Local Development Setup

### 1. Install PostgreSQL

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Windows (WSL):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
psql postgres
CREATE DATABASE vibepass_dev;
CREATE USER vibepass_dev WITH PASSWORD 'dev_password_123';
ALTER ROLE vibepass_dev WITH CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE vibepass_dev TO vibepass_dev;
\q
```

Update `.env`:
```
DATABASE_URL="postgresql://vibepass_dev:dev_password_123@localhost:5432/vibepass_dev"
```

### 3. Install Redux

**macOS:**
```bash
brew install redis
brew services start redis
```

**Windows (WSL):**
```bash
sudo apt-get install redis-server
sudo service redis-server start
```

### 4. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 5. Setup Prisma

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed database
npx prisma db seed
```

### 6. Start Development Servers

**Terminal 1: Backend**
```bash
cd backend
npm run start:dev
# Runs on http://localhost:3003
```

**Terminal 2: Frontend**
```bash
cd frontend
npm run dev
# Runs on http://localhost:3002
```

### 7. Verify Setup

- Frontend: `http://localhost:3002`
- Backend API: `http://localhost:3003/api/v1`
- WebSocket: `ws://localhost:3003`

---

## Production Environment Variables

### Backend Production (.env.production)

```bash
NODE_ENV=production
PORT=3000

DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]"
REDIS_URL="redis://[user]:[password]@[host]:[port]"

JWT_SECRET="[generate-with-crypto-module]"
JWT_REFRESH_SECRET="[different-secret]"

SMTP_HOST="sendgrid"  # Or SendGrid, Mailgun
SMTP_USER="apikey"
SMTP_PASS="[sendgrid-api-key]"

FRONTEND_URL="https://vibepass.com"
WS_URL="wss://api.vibepass.com"

AWS_S3_BUCKET="vibepass-prod"
AWS_S3_REGION="us-east-1"

SENTRY_DSN="[production-sentry-dsn]"

LOG_LEVEL="info"

ENABLE_ANALYTICS=true
```

### Frontend Production (.env.production)

```bash
NEXT_PUBLIC_API_URL="https://api.vibepass.com/api/v1"
NEXT_PUBLIC_WS_URL="wss://api.vibepass.com"
NEXT_PUBLIC_ENV="production"
NEXT_PUBLIC_GA_ID="UA-XXXXXXXXX-X"
NEXT_PUBLIC_SENTRY_DSN="[production-sentry-dsn]"
```

---

## Docker Setup (Optional)

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: vibepass_db
    environment:
      POSTGRES_DB: vibepass_dev
      POSTGRES_USER: vibepass_dev
      POSTGRES_PASSWORD: dev_password_123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: vibepass_redis
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

**Run Docker services:**
```bash
docker-compose up -d
```

---

## Secrets Management

### Development
- Store secrets in `.env` files (git-ignored)
- Never commit `.env` files

### Production
- Use environment management service:
  - **Railway:** Built-in secrets
  - **Render:** Environment variables panel
  - **Heroku:** Config variables
  - **AWS Systems Manager:** Parameter Store
  - **HashiCorp Vault:** Enterprise solution

**Rotate secrets regularly:**
```bash
# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## CI/CD Environment Variables

### GitHub Actions Example

```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
  SENTRY_DSN: ${{ secrets.SENTRY_DSN }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run test
```

---

## Troubleshooting

**PostgreSQL connection refused:**
```bash
# Check if running
brew services list  # macOS
systemctl status postgresql  # Linux
```

**Redis connection refused:**
```bash
# Start Redis
redis-server
# In another terminal
redis-cli ping  # Should return "PONG"
```

**Prisma migration issues:**
```bash
# Reset database (dev only!)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

**WebSocket connection issues:**
- Ensure `SOCKET_IO_CORS_ORIGIN` matches frontend URL
- Check firewall (port 3003)
- Verify WSS cert in production

---

## Security Checklist

✓ Never commit `.env` files  
✓ Use strong passwords (16+ chars, mix case)  
✓ Rotate secrets every 90 days  
✓ Use HTTPS/WSS in production  
✓ Enable database encryption at rest  
✓ Use VPC for database access  
✓ Enable audit logging  
✓ Use service-to-service auth (API keys)  

---

**See:** SECURITY.md for comprehensive security guide.
