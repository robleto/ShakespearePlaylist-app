# ⚡ Quick Start

Single authoritative sources now:
- Deployment + env vars + Stripe + Neon → `DEPLOYMENT.md`
- Business & roadmap → `BUSINESS-STRATEGY.md`

## 60-Second Local Spin-Up
```bash
git clone <repo>
cd GameAwardsAPI
npm install
npm run dev
curl "http://localhost:3000/api/?s=wingspan&apikey=demo"
```

## Add Stripe (Test Mode)
```bash
cp .env.example .env     # fill DATABASE_URL + Stripe test keys
node setup-stripe-products.js  # prints price + webhook secrets
```
Add printed env vars to Netlify UI (don’t commit secrets) then deploy.

## Verify
```bash
node scripts/run-function.js api "s=wingspan&apikey=demo"
curl http://localhost:4000/.netlify/functions/health
```

Need detail? Open `DEPLOYMENT.md` (section 2 env vars, section 4 webhooks).
