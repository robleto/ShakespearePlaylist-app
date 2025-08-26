# ShakesFind 🎭

A production-ready MVP that continuously discovers and normalizes upcoming Shakespeare productions from multiple theater websites into a Neon Postgres database, exposes a simple API, and publishes a Next.js site on Netlify.

## 🚀 Features

- **Automated Scraping**: Discovers productions from 5 major Shakespeare theaters
- **Smart Normalization**: Maps raw titles to canonical Shakespeare plays using configurable aliases
- **Multiple Data Sources**: Supports ICS calendars, JSON-LD, and HTML parsing
- **Admin Interface**: Review queue for low-confidence items with approval/edit workflow
- **Public API**: RESTful endpoints for productions and companies
- **Search & Filters**: Find productions by play, location, and date range
- **Rate Limited & Polite**: Respects robots.txt and implements proper crawling etiquette

## 🏗️ Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js Route Handlers + background workers
- **Database**: Neon Postgres with Prisma ORM
- **Auth**: NextAuth.js (Email magic link + GitHub OAuth)
- **Hosting**: Netlify
- **CI/CD**: GitHub Actions for scheduled scraping
- **Monitoring**: Console logging + health endpoints

## 🎯 Supported Theaters

1. **Alabama Shakespeare Festival** (asf.net)
2. **American Shakespeare Center** (americanshakespearecenter.com)
3. **Oregon Shakespeare Festival** (osfashland.org)
4. **Shakespeare Theatre Company** (shakespearetheatre.org)
5. **Utah Shakespeare Festival** (bard.org)

## 📊 Data Pipeline

### Ingestion Priority
1. **ICS Calendars** (95% confidence) - If discoverable
2. **JSON-LD** (90% confidence) - schema.org/Event structured data
3. **HTML Heuristics** (60% confidence) - Conservative pattern matching

### Processing Flow
1. **Fetch**: Polite crawling with robots.txt respect and rate limiting
2. **Parse**: Extract events using appropriate parser
3. **Normalize**: Map to canonical plays and standardize dates
4. **Deduplicate**: Avoid duplicate productions per company/play/date
5. **Review**: Queue low-confidence items for admin approval

## 🚧 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- Neon Postgres database
- (Optional) GitHub OAuth app
- (Optional) Email provider for magic links

### 1. Clone and Install
```bash
git clone <repository-url>
cd ShakesFind
pnpm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Required
DATABASE_URL="postgresql://user:password@your-neon-url/database"
NEXTAUTH_SECRET="your-secure-random-string"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="your-email@example.com"

# Optional
GITHUB_ID="your-github-oauth-id"
GITHUB_SECRET="your-github-oauth-secret"
```

### 3. Database Setup
```bash
# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# Seed initial data
pnpm prisma db seed
```

### 4. Development
```bash
# Start dev server
pnpm dev

# Run scraper manually
pnpm scrape

# Run tests
pnpm test
```

Visit `http://localhost:3000` to see the site.

## 🌐 Deployment

### Neon Database
1. Create a new Neon project
2. Copy the connection string to `DATABASE_URL`
3. Run migrations: `pnpm prisma migrate deploy`

### Netlify Deployment
1. Connect your GitHub repository to Netlify
2. Set build command: `pnpm build`
3. Set publish directory: `.next`
4. Add environment variables in Netlify dashboard
5. Deploy!

### GitHub Actions Setup
Add these secrets to your GitHub repository:
- `DATABASE_URL`: Your Neon connection string
- `NEXTAUTH_SECRET`: Same as in your .env

The scraper will run automatically at 3:15 AM UTC daily.

## 📡 API Documentation

### Productions Endpoint
```
GET /api/productions
```

**Query Parameters:**
- `play`: Filter by canonical play (e.g., "HAMLET")
- `companyId`: Filter by specific company
- `q`: Search query (company, city, or play name)
- `start`: Start date filter (ISO format)
- `end`: End date filter (ISO format)
- `limit`: Results per page (default: 20, max: 100)
- `cursor`: Pagination cursor

**Example:**
```bash
curl "https://yoursite.netlify.app/api/productions?play=HAMLET&limit=10"
```

### Companies Endpoint
```
GET /api/companies
```

**Query Parameters:**
- `q`: Search query (name or city)
- `region`: Filter by state/region
- `country`: Filter by country (default: US)
- `limit`: Results per page (default: 20)
- `cursor`: Pagination cursor

## 🛠️ Development Guide

### Adding New Theaters

1. **Create adapter**: Add file in `lib/scraping/adapters/`
```typescript
export async function scrapeTheaterName(): Promise<NormalizedEvent[]> {
  // Implementation
}
```

2. **Register scraper**: Add to `scripts/scrape.ts` SCRAPERS object

3. **Add to seed**: Include company in `prisma/seed.ts`

### Custom Play Aliases

Edit `lib/normalization/plays.ts` to add new regex patterns:
```typescript
{
  pattern: '(?i)custom\\s+pattern',
  play: CanonicalPlay.YOUR_PLAY,
  confidence: 0.9,
}
```

### Parser Extensions

- **ICS**: Extend `lib/scraping/parse-ics.ts`
- **JSON-LD**: Extend `lib/scraping/parse-jsonld.ts`
- **HTML**: Extend `lib/scraping/parse-html.ts`

## 🔐 Admin Interface

Access admin features at `/admin` (requires authentication):

### Review Queue
- View productions awaiting approval
- Edit canonicalPlay, dates, and venue
- Approve or archive items
- Bulk actions for efficiency

### Source Management
- Monitor scraping health
- Enable/disable sources
- Manual re-crawl triggers
- View last run status

## 📊 Data Model

### Core Entities
- **Company**: Theater organizations
- **Venue**: Performance locations
- **Production**: Individual shows
- **Source**: Scraping endpoints
- **RawPage**: Cached content for debugging

### Relationships
```
Company 1:N Productions
Company 1:N Sources
Company 1:N Venues
Venue 1:N Productions
Source 1:N RawPages
```

## ⚙️ Configuration

### Rate Limiting
Default: 1 request/second per domain. Adjust in `lib/scraping/fetch.ts`:
```typescript
setRateLimit(2000) // 2 seconds
```

### Confidence Thresholds
- Auto-publish: >80% confidence
- Review queue: 20-80% confidence
- Auto-reject: <20% confidence

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Test specific parser
pnpm test parse-jsonld

# Test with coverage
pnpm test --coverage
```

### Test Data
Sample fixtures are included in `__tests__/fixtures/` for offline testing.

## 📈 Monitoring

### Health Endpoints
- `/api/health`: Basic service status
- `/api/health/db`: Database connectivity
- `/api/health/sources`: Last scraping status

### Logging
Structured console logging with error tracking. Production logs available in Netlify functions dashboard.

## 🛡️ Security & Compliance

- **Robots.txt**: Automatically checked before crawling
- **Rate Limiting**: Configurable delays between requests
- **User-Agent**: Identifies as "ShakesFindBot/0.1"
- **Attribution**: Links back to original box office pages
- **Opt-out**: Easy disable mechanism for theater operators

## 🚨 Troubleshooting

### Common Issues

**Database Connection**
```bash
# Test connection
pnpm prisma db push
```

**Scraping Failures**
```bash
# Check individual adapter
node -e "console.log(require('./lib/scraping/adapters/asf.net.js').scrapeASF())"
```

**Build Errors**
```bash
# Clear cache
rm -rf .next node_modules
pnpm install
```

### Debug Mode
Set `NODE_ENV=development` for verbose logging.

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

For major changes, please open an issue first to discuss.

## 📞 Support

- **Issues**: GitHub Issues
- **Email**: admin@shakesfind.com
- **Docs**: This README + inline code comments

---

**Built with ❤️ for the Shakespeare theater community**

## 🗂 Route Structure & Layout Strategy

This project uses Next.js App Router route groups (folder names in parentheses) to separate concerns without affecting URLs:

```
app/
  (site)/               # Public site pages (these map directly to /companies, /plays, /productions, etc.)
    layout.tsx          # Public shell: Header/Footer, metadata, skip link
    companies/
    plays/
    productions/
  (admin)/              # Admin area grouping (auth‑protected)
    layout.tsx          # Auth gate + minimal wrapper
    admin/              # Actual URL segment /admin/*
      layout.tsx        # Admin shell (nav, spacing)
      page.tsx          # /admin (review queue)
      sources/page.tsx  # /admin/sources (source status)
  admin/ (legacy)       # Older admin implementation (can be consolidated later)
```

Why route groups:
- Provide separate layout shells (public vs admin) without nesting extra path segments.
- Allow future groups (e.g., `(auth)` for login flows or `(marketing)` for landing pages) while keeping clean URLs.
- Enable incremental refactors (you can stage a new group alongside an old one, then retire the old code).

Public Layout Enhancements:
- Exports `metadata` for SEO & social cards.
- Adds an accessible skip link and proper `<main id="site-main">` landmark.

Admin Group Scaffold:
- `(admin)/layout.tsx` performs role check (`ADMIN`) and redirects unauthenticated users.
- Inner `admin/layout.tsx` provides navigation and page chrome.
- Pages under `admin/` fetch data server-side (e.g., review queue, sources).

Refactor Notes:
- Legacy duplicate pages at `app/companies`, `app/plays`, `app/productions` were removed in favor of `(site)` versions.
- When confident, you can migrate any remaining older admin pages into the grouped structure and delete the legacy `app/admin` folder.

To add a new public page:
1. Create `app/(site)/<segment>/page.tsx`.
2. The URL will be `/<segment>` automatically.
3. Shared Header/Footer applied via `(site)/layout.tsx`.

To add a new admin tool page:
1. Add file under `app/(admin)/admin/<tool>/page.tsx`.
2. It becomes available at `/admin/<tool>` with auth + admin shell.

