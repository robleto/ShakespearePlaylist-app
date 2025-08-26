# Game Awards API Deployment Guide

# Netlify + Neon + Stripe Deployment (Authoritative Guide)

# 🚀 Deployment Guide (Netlify + Neon + Stripe)

This section provides the production-ready path you selected (Step 5 from earlier planning) using Netlify Functions, Neon PostgreSQL, and Stripe subscriptions.

## 1. Environments & Branching
| Environment | Branch | Purpose | Notes |
|-------------|--------|---------|-------|
| Production  | main   | Public traffic | Auto-deploy on push |
| Staging (opt) | staging | Pre-prod verification | Use a Neon branch |
| Preview (auto) | PR branches | Feature QA | Disposable deploys |

Neon: create a staging branch if needed: `neonctl branches create staging` (or via console UI) then new connection string.

## 2. Required Environment Variables (Netlify UI)
Set per context (Production / Deploy Previews). Never commit secrets.

| Variable | Purpose |
|----------|---------|
| NODE_ENV=production | Enables prod code paths |
| DATABASE_URL | Neon connection string (`?sslmode=require`) |
| STRIPE_PUBLISHABLE_KEY | Stripe publishable key (test/live) |
| STRIPE_SECRET_KEY | Stripe secret key |
| STRIPE_PRICE_PROFESSIONAL_MONTHLY | Price ID from setup script |
| STRIPE_PRICE_PROFESSIONAL_ANNUAL | Price ID |
| STRIPE_PRICE_ENTERPRISE_MONTHLY | Price ID |
| STRIPE_PRICE_ENTERPRISE_ANNUAL | Price ID |
| STRIPE_WEBHOOK_SECRET | Webhook signature secret (test & live) |
| REQUIRE_API_KEY=true | Enforce key for requests |
| DEPLOY_ENV=production | Surfaces in build-info.json |
| API_KEY_SECRET (future) | Pepper for hashing if added |

Optional (Express path fallback): `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`.

## 3. Build & Deploy Flow
Netlify uses `netlify.toml`:
* Build command: `npm run build`
* Functions dir: `netlify/functions`
* Publish dir: `public`

`npm run build` now generates `build-info.json` (commit, branch, timestamp, DEPLOY_ENV). Health function includes this when present.

## 4. Stripe Webhook Lifecycle
1. Test mode first—run `node setup-stripe-products.js` (already done) and copy price IDs to env.
2. Add webhook endpoint (script created one placeholder). Update the URL to real Netlify site if changed and capture new secret.
3. Local test (optional):
```
stripe listen --forward-to localhost:4000/.netlify/functions/webhook-stripe
stripe trigger customer.subscription.created
```
4. On success (200) verify DB: `SELECT tier,daily_limit,monthly_limit,stripe_subscription_id FROM api_keys LIMIT 5;`
5. Switch to live: repeat product creation in live mode (or manually), update env vars, redeploy.

## 5. Database (Neon) Prep
Current reads are JSON in-memory; after migration to SQL searching, add indexes:
```sql
CREATE INDEX IF NOT EXISTS idx_awards_year ON awards(year);
CREATE INDEX IF NOT EXISTS idx_awards_award_name_lower ON awards(LOWER(award_name));
CREATE INDEX IF NOT EXISTS idx_awards_category_lower ON awards(LOWER(category));
CREATE INDEX IF NOT EXISTS idx_awards_winner_lower ON awards(LOWER(winner_name));
```
Future: full-text or trigram index for fuzzy search.

## 6. Deployment Checklist
| Step | Action | Verification |
|------|--------|-------------|
| 1 | Push latest changes to `main` | Netlify deploy kicks off automatically |
| 2 | Ensure no secrets committed (`git grep -i sk_live` etc.) | Zero hits |
| 3 | Populate test env vars (Stripe test keys, Neon `DATABASE_URL`, price IDs, webhook secret) | Netlify UI shows all required vars green |
| 4 | Build & open `/health` | 200 + build.commit + database.status=connected |
| 5 | Sample query with demo key (`run-function.js api "s=wingspan&apikey=demo"`) | Response.Response = True, rate limit headers present |
| 6 | Create subscription (POST create-subscription) using test card 4242… | 200 JSON with `client_secret`, `api_key` |
| 7 | Confirm customer + subscription in Stripe dashboard | Shows correct price + status = incomplete/active after payment |
| 8 | Complete payment (Stripe test payment intent) | Subscription status = active |
| 9 | Query Neon: `SELECT tier,daily_limit,monthly_limit FROM api_keys WHERE api_key='...'` | Row matches chosen plan limits |
| 10 | Trigger `invoice.payment_failed` via Stripe CLI | API key suspended (calls return 429 or error flag) |
| 11 | Trigger `invoice.payment_succeeded` | API key restored; limits reset (daily remaining decreases on call) |
| 12 | Swap to live keys & create live products; update envs (Production context) | `/health` build reflects DEPLOY_ENV=production-live (optional) |
| 13 | Run smoke tests (`npm test`) | All tests green |
| 14 | Announce + monitor first 48h | Log anomalies triaged |

## 7. Observability Roadmap
Phase 1 (now): rely on Netlify logs.
Phase 2: add structured JSON logs with request id & latency.
Phase 3: optional metrics endpoint + external log shipping.

## 8. Performance & Caching
Before DB search: fine. After migration:
* Add `Cache-Control: public,max-age=30` for non-keyed demo responses.
* Consider ETag + conditional GET later.

## 9. Security Notes
| Area | Current | Next Step |
|------|---------|-----------|
| API Key Hash | SHA-256 | Add pepper (API_KEY_SECRET) |
| Webhook | Stripe signature verify | Rotate annually |
| CORS | `*` | Narrow if browsers integrate |
| Demo Key | Unrestricted dev flows | Add soft daily cap |

## 10. Rollback Strategy
* Netlify: revert to prior deploy via UI.
* Neon: create branch snapshot before risky migrations.
* Stripe: never delete prices—create new & migrate customers.

## 11. Launch Sequence
1. Final test subscription & cancellation.
2. Ensure health endpoint returns build info.
3. Smoke tests: search, id, bgg_id, subscription creation.
4. Publish docs/pricing updates.
5. Monitor logs & DB usage counters for first 48h.

## 12. Future Platform Alternatives
| Platform | Change Needed |
|----------|---------------|
| Vercel | Port functions to `api/` routes |
| Fly.io | Containerize `server.js` or express adapter |
| Render | Same image as Fly |

Netlify remains fine until heavier real-time needs appear.

## 13. Quick Local Verification
```
npm run build
node local-functions-server.js &
curl http://localhost:4000/.netlify/functions/health
node scripts/run-function.js api "s=wingspan&apikey=demo"
curl -X POST http://localhost:4000/.netlify/functions/create-subscription \
	-H 'Content-Type: application/json' \
	-d '{"email":"test@example.com","name":"Test User","plan":"professional_monthly"}'
```

## 14. Immediate Next (Post-Deploy) Enhancements
* Migrate API search to SQL with optional flag `USE_DB=1`.
* Add test suite covering subscription + rate limits.
* Launch minimal marketing doc improvements.

---
This document supersedes prior short-form deployment, migration, and Stripe setup markdown files (now removed). For quick local start see `QUICK-START.md`.
