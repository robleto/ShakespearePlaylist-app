import { PrismaClient, CanonicalPlay } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create companies
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: 'Alabama Shakespeare Festival',
        website: 'https://asf.net',
        city: 'Montgomery',
        region: 'AL',
        country: 'US',
        lat: 32.361538,
        lng: -86.279118,
      },
    }),
    prisma.company.create({
      data: {
        name: 'American Shakespeare Center',
        website: 'https://americanshakespearecenter.com',
        city: 'Staunton',
        region: 'VA',
        country: 'US',
        lat: 38.14957,
        lng: -79.071045,
      },
    }),
    prisma.company.create({
      data: {
        name: 'Oregon Shakespeare Festival',
        website: 'https://osfashland.org',
        city: 'Ashland',
        region: 'OR',
        country: 'US',
        lat: 42.194397,
        lng: -122.709011,
      },
    }),
    prisma.company.create({
      data: {
        name: 'Shakespeare Theatre Company',
        website: 'https://shakespearetheatre.org',
        city: 'Washington',
        region: 'DC',
        country: 'US',
        lat: 38.906611,
        lng: -77.028770,
      },
    }),
    prisma.company.create({
      data: {
        name: 'Utah Shakespeare Festival',
        website: 'https://bard.org',
        city: 'Cedar City',
        region: 'UT',
        country: 'US',
        lat: 37.677734,
        lng: -113.061896,
      },
    }),
  ])

  // Create initial sources for each company
  const sources = await Promise.all(
    companies.map((company) =>
      prisma.source.create({
        data: {
          companyId: company.id,
          url: company.website,
          kind: 'HTML',
          parserName: new URL(company.website).hostname,
          enabled: true,
        },
      })
    )
  )

  // Create common aliases
  const aliases = await Promise.all([
    prisma.alias.create({
      data: {
        rawPattern: 'r\\s*[&+]\\s*j|romeo.*juliet',
        canonicalPlay: CanonicalPlay.ROMEO_AND_JULIET,
        confidence: 0.9,
      },
    }),
    prisma.alias.create({
      data: {
        rawPattern: 'scottish\\s+play|the\\s+scottish\\s+play',
        canonicalPlay: CanonicalPlay.MACBETH,
        confidence: 0.95,
      },
    }),
    prisma.alias.create({
      data: {
        rawPattern: '12th\\s+night|twelfth\\s+night',
        canonicalPlay: CanonicalPlay.TWELFTH_NIGHT,
        confidence: 0.9,
      },
    }),
    prisma.alias.create({
      data: {
        rawPattern: 'midsummer.*dream|mnd',
        canonicalPlay: CanonicalPlay.MIDSUMMER_NIGHT_S_DREAM,
        confidence: 0.85,
      },
    }),
    prisma.alias.create({
      data: {
        rawPattern: 'much\\s+ado',
        canonicalPlay: CanonicalPlay.MUCH_ADO_ABOUT_NOTHING,
        confidence: 0.9,
      },
    }),
    prisma.alias.create({
      data: {
        rawPattern: 'merchant.*venice|mov',
        canonicalPlay: CanonicalPlay.MERCHANT_OF_VENICE,
        confidence: 0.85,
      },
    }),
    prisma.alias.create({
      data: {
        rawPattern: 'taming.*shrew',
        canonicalPlay: CanonicalPlay.TAMING_OF_THE_SHREW,
        confidence: 0.9,
      },
    }),
    prisma.alias.create({
      data: {
        rawPattern: 'as\\s+you\\s+like\\s+it|ayli',
        canonicalPlay: CanonicalPlay.AS_YOU_LIKE_IT,
        confidence: 0.9,
      },
    }),
    prisma.alias.create({
      data: {
        rawPattern: 'all.*s\\s+well|awew',
        canonicalPlay: CanonicalPlay.ALL_S_WELL_THAT_ENDS_WELL,
        confidence: 0.85,
      },
    }),
    prisma.alias.create({
      data: {
        rawPattern: 'winter.*s\\s+tale|wt',
        canonicalPlay: CanonicalPlay.WINTER_S_TALE,
        confidence: 0.85,
      },
    }),
  ])

  console.log('✅ Seeding completed!')
  console.log(`📊 Created:`)
  console.log(`   ${companies.length} companies`)
  console.log(`   ${sources.length} sources`)
  console.log(`   ${aliases.length} aliases`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
