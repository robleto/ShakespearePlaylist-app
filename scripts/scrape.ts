import { scrapeASF } from '../lib/scraping/adapters/asf.net'
import { scrapeASC } from '../lib/scraping/adapters/americanshakespearecenter.com'
import { scrapeOSF } from '../lib/scraping/adapters/osfashland.org'
import { scrapeSTC } from '../lib/scraping/adapters/shakespearetheatre.org'
import { scrapeUSF } from '../lib/scraping/adapters/bard.org'
import { getAllSources, updateSourceStatus } from '../lib/services/sources'
import { createOrUpdateProduction } from '../lib/services/productions'
import type { NormalizedEvent } from '../lib/normalization/normalize'

const SCRAPERS = {
  'asf.net': scrapeASF,
  'americanshakespearecenter.com': scrapeASC,
  'osfashland.org': scrapeOSF,
  'shakespearetheatre.org': scrapeSTC,
  'bard.org': scrapeUSF,
}

async function main() {
  console.log('🚀 Starting Shakespeare production scraping...')
  
  try {
    const sources = await getAllSources()
    console.log(`Found ${sources.length} sources to process`)
    
    let totalNewProductions = 0
    let totalUpdatedProductions = 0
    
    for (const source of sources) {
      if (!source.enabled) {
        console.log(`⏭️  Skipping disabled source: ${source.url}`)
        continue
      }
      
      const domain = new URL(source.url).hostname
      const scraper = SCRAPERS[domain as keyof typeof SCRAPERS]
      
      if (!scraper) {
        console.log(`❌ No scraper found for domain: ${domain}`)
        await updateSourceStatus(source.id, 'ERROR: No scraper available')
        continue
      }
      
      try {
        console.log(`🎭 Processing ${source.company.name} (${domain})...`)
        
        const events = await scraper()
        console.log(`Found ${events.length} events from ${source.company.name}`)
        
        let newCount = 0
        let updatedCount = 0
        
        for (const event of events) {
          try {
            const { production, isNew } = await createOrUpdateProduction({
              ...event,
              companyId: source.companyId,
            })
            
            if (isNew) {
              newCount++
              console.log(`  ✅ Created: ${event.titleRaw}`)
            } else {
              updatedCount++
              console.log(`  🔄 Updated: ${event.titleRaw}`)
            }
          } catch (productionError) {
            console.error(`  ❌ Failed to save production "${event.titleRaw}":`, productionError)
          }
        }
        
        totalNewProductions += newCount
        totalUpdatedProductions += updatedCount
        
        await updateSourceStatus(
          source.id,
          `SUCCESS: ${newCount} new, ${updatedCount} updated`
        )
        
        console.log(`✅ ${source.company.name}: ${newCount} new, ${updatedCount} updated`)
        
      } catch (scraperError) {
        console.error(`❌ Failed to scrape ${source.company.name}:`, scraperError)
        await updateSourceStatus(
          source.id,
          `ERROR: ${scraperError instanceof Error ? scraperError.message : 'Unknown error'}`
        )
      }
    }
    
    console.log('\n🎉 Scraping completed!')
    console.log(`📊 Summary:`)
    console.log(`   📝 ${totalNewProductions} new productions`)
    console.log(`   🔄 ${totalUpdatedProductions} updated productions`)
    
  } catch (error) {
    console.error('💥 Scraping failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
    .then(() => {
      console.log('✨ Scraping script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Scraping script failed:', error)
      process.exit(1)
    })
}
