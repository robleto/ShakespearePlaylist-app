const { scrapeOSF } = require('./lib/scraping/adapters/osfashland.org.ts')

async function testOSF() {
  console.log('Testing OSF scraper...')
  try {
    const events = await scrapeOSF()
    console.log(`Found ${events.length} events:`)
    events.forEach((event, i) => {
      console.log(`${i + 1}. ${event.titleRaw} - ${event.startDate} (confidence: ${event.confidence})`)
    })
  } catch (error) {
    console.error('Error:', error)
  }
}

testOSF()
