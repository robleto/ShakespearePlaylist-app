import { scrapeASF } from '../lib/scraping/adapters/asf.net'
import { scrapeASC } from '../lib/scraping/adapters/americanshakespearecenter.com'
import { scrapeOSF } from '../lib/scraping/adapters/osfashland.org'
import { scrapeSTC } from '../lib/scraping/adapters/shakespearetheatre.org'
import { scrapeUSF } from '../lib/scraping/adapters/bard.org'
import { scrapeGuthrieOrg } from '../lib/scraping/adapters/guthrie.org'
import { getAllSources, updateSourceStatus } from '../lib/services/sources'
import { createOrUpdateProduction, computeRegressionStatus } from '../lib/services/productions'
import { prisma } from '../lib/db'
import type { NormalizedEvent } from '../lib/normalization/normalize'
import { CanonicalPlay } from '@prisma/client'
const QUIET = process.env.QUIET === '1'

// ---------------- CLI ARG PARSING ----------------
interface ScrapeArgs {
  list: boolean
  domains: Set<string>
  dryRun: boolean
  cooldownHours: number
  force: boolean
}

function parseArgs(): ScrapeArgs {
  const raw = process.argv.slice(2)
  const args: ScrapeArgs = {
    list: raw.includes('--list'),
    domains: new Set<string>(),
    dryRun: raw.includes('--dry-run'),
    cooldownHours: 6,
    force: raw.includes('--force'),
  }
  for (const token of raw) {
    if (token.startsWith('--domain=')) {
      token.replace('--domain=', '')
        .split(',')
        .map((d) => d.trim().toLowerCase())
        .filter(Boolean)
        .forEach((d) => args.domains.add(d))
    }
    if (token.startsWith('--cooldown-hours=')) {
      const v = parseFloat(token.split('=')[1])
      if (!isNaN(v) && v >= 0) args.cooldownHours = v
    }
  }
  return args
}

const ARGS = parseArgs()

function printUsage() {
  console.log(`Shakespeare Scraper
Usage:
  npm run scrape -- [options]

Options:
  --list                 List configured sources and exit (no scraping)
  --domain=foo.com,bar   Only scrape these domain hostnames
  --dry-run              Do not persist; show what WOULD be created/updated
  --cooldown-hours=N     Skip sources scraped within the last N hours (default 6)
  --force                Ignore cooldown and scrape anyway
  QUIET=1                Minimal output summary

Examples:
  npm run scrape -- --list
  npm run scrape -- --domain=guthrie.org --dry-run
  npm run scrape -- --domain=bard.org --cooldown-hours=24
`)
}

const SCRAPERS = {
  'asf.net': scrapeASF,
  'americanshakespearecenter.com': scrapeASC,
  'osfashland.org': scrapeOSF,
  'shakespearetheatre.org': scrapeSTC,
  'bard.org': scrapeUSF,
  'guthrie.org': scrapeGuthrieOrg,
}

async function main() {
  if (ARGS.list) {
    const sources = await getAllSources()
    console.log('📇 Sources:')
    for (const s of sources) {
      const last = s.lastRunAt ? s.lastRunAt.toISOString() : 'never'
      console.log(`${s.enabled ? '✅' : '⛔'} ${new URL(s.url).hostname.padEnd(28)}  lastRun: ${last}  status: ${s.lastStatus || ''}`)
    }
    return
  }

  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    printUsage()
    return
  }

  if (!QUIET) console.log('🚀 Starting Shakespeare production scraping (selective mode)...')
  
  try {
    let sources = await getAllSources()
    if (ARGS.domains.size > 0) {
      sources = sources.filter((s) => ARGS.domains.has(new URL(s.url).hostname))
    }
    const cooldownMs = ARGS.cooldownHours * 60 * 60 * 1000
    const now = Date.now()
    if (!ARGS.force) {
      sources = sources.filter((s) => !s.lastRunAt || (now - s.lastRunAt.getTime()) > cooldownMs)
    }
  if (!QUIET) console.log(`Found ${sources.length} sources to process (domains filter: ${ARGS.domains.size > 0 ? Array.from(ARGS.domains).join(',') : 'none'}, cooldown ${ARGS.force ? 'ignored' : ARGS.cooldownHours + 'h'})`)
    
    let totalNewProductions = 0
    let totalUpdatedProductions = 0
    
    for (const source of sources) {
      if (!source.enabled) {
  if (!QUIET) console.log(`⏭️  Skipping disabled source: ${source.url}`)
        continue
      }
      
      const domain = new URL(source.url).hostname
  const scraper = SCRAPERS[domain as keyof typeof SCRAPERS]
      
      if (!scraper) {
  if (!QUIET) console.log(`❌ No scraper found for domain: ${domain}`)
        await updateSourceStatus(source.id, 'ERROR: No scraper available')
        continue
      }
      
      try {
  if (!QUIET) console.log(`🎭 Processing ${source.company.name} (${domain})...`)
        
  const prePublished = await prisma.production.count({ where: { companyId: source.companyId, status: 'PUBLISHED' } })
        // If company has a listingsPageUrl that differs from the base source url's domain root,
        // we can fetch that page first and (in future) pass it to a generic extractor.
        // For now: scraper() remains domain-specific; we just log the override for visibility.
        const listingsUrl = (source.company as any).listingsPageUrl as string | undefined
        if (listingsUrl) {
          if (!QUIET) console.log(`   🔎 Using company listingsPageUrl: ${listingsUrl}`)
        }
        const events = await scraper()
  if (!QUIET) console.log(`Found ${events.length} events from ${source.company.name}`)
        
        let newCount = 0
        let updatedCount = 0
        
        if (ARGS.dryRun) {
          // Simulate filtering (mirror createOrUpdateProduction guards)
          const candidates = events.filter(e => e.canonicalPlay !== (CanonicalPlay as any).OTHER && (e.sourceConfidence || 0) >= 0.7)
          newCount = candidates.length // in dry-run treat all as potential new
          if (!QUIET) {
            console.log(`  🧪 Dry-run: ${candidates.length} / ${events.length} events would be persisted (>=0.7 & not OTHER)`) 
          }
        } else {
          for (const event of events) {
            try {
              const { isNew } = await createOrUpdateProduction({
                ...event,
                companyId: source.companyId,
              })
              if (isNew) {
                newCount++
                if (!QUIET) console.log(`  ✅ Created: ${event.titleRaw}`)
              } else {
                updatedCount++
                if (!QUIET) console.log(`  🔄 Updated: ${event.titleRaw}`)
              }
            } catch (productionError) {
              if (!QUIET) console.error(`  ❌ Skip: "${event.titleRaw}" ->`, (productionError as Error).message)
            }
          }
        }
        
  totalNewProductions += newCount
  totalUpdatedProductions += updatedCount
  const postPublished = await prisma.production.count({ where: { companyId: source.companyId, status: 'PUBLISHED' } })
  const statusBase = `${ARGS.dryRun ? 'DRY-RUN' : 'SUCCESS'}: ${newCount} new, ${updatedCount} updated (pub ${prePublished}→${postPublished})`
  const status = computeRegressionStatus(prePublished, postPublished, statusBase)
  await updateSourceStatus(source.id, status)
        
  if (!QUIET) console.log(`✅ ${source.company.name}: ${newCount} new, ${updatedCount} updated`)
        
      } catch (scraperError) {
        console.error(`❌ Failed to scrape ${source.company.name}:`, scraperError)
        await updateSourceStatus(
          source.id,
          `ERROR: ${scraperError instanceof Error ? scraperError.message : 'Unknown error'}`
        )
      }
    }
    
    if (!QUIET) {
      console.log('\n🎉 Scraping completed!')
      console.log(`📊 Summary:`)
      console.log(`   Mode: ${ARGS.dryRun ? 'DRY-RUN (no persistence)' : 'LIVE'}`)
  console.log(`   Filtered domains: ${ARGS.domains.size > 0 ? Array.from(ARGS.domains).join(', ') : 'none'}`)
      console.log(`   📝 ${totalNewProductions} ${ARGS.dryRun ? 'potential' : 'new'} productions`)
      console.log(`   🔄 ${totalUpdatedProductions} updated productions`)
    } else {
      console.log(`SUMMARY mode=${ARGS.dryRun ? 'DRY' : 'LIVE'} new=${totalNewProductions} updated=${totalUpdatedProductions}`)
    }
    
  } catch (error) {
    console.error('💥 Scraping failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
    .then(() => {
  if (!QUIET) console.log('✨ Scraping script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Scraping script failed:', error)
      process.exit(1)
    })
}
