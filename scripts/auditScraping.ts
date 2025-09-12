import { prisma } from '../lib/db'
import { PLAY_TITLES } from '../lib/normalization/plays'

async function main() {
  const companies = await prisma.company.findMany({
    include: {
      sources: true,
      productions: true,
    },
    orderBy: { name: 'asc' },
  })

  const rows: string[] = []
  let totalPublished = 0
  let totalReview = 0
  const playCounts: Record<string, number> = {}

  for (const c of companies) {
    const pub = c.productions.filter(p => p.status === 'PUBLISHED')
    const review = c.productions.filter(p => p.status === 'REVIEW')
    totalPublished += pub.length
    totalReview += review.length
    for (const p of pub) {
      playCounts[p.canonicalPlay] = (playCounts[p.canonicalPlay] || 0) + 1
    }
    const lastRun = c.sources.map(s => s.lastRunAt).filter(Boolean).sort((a,b)=>b!.getTime()-a!.getTime())[0]
    const lastStatus = c.sources.map(s => s.lastStatus).filter(Boolean).slice(-1)[0]
    rows.push(`${c.name}\tPUB:${pub.length}\tREVIEW:${review.length}\tSRC:${c.sources.length}\tLAST:${lastRun ? lastRun.toISOString().split('T')[0] : '-'}\tSTATUS:${lastStatus || '-'} `)
  }

  console.log('=== Company Production Summary ===')
  rows.forEach(r => console.log(r))
  console.log('\nTotals:')
  console.log(`  Published: ${totalPublished}`)
  console.log(`  Review:    ${totalReview}`)
  console.log(`  Companies: ${companies.length}`)

  console.log('\n=== Play Coverage (Published) ===')
  const sortedPlayCounts = Object.entries(playCounts).sort((a,b)=>b[1]-a[1])
  for (const [play, count] of sortedPlayCounts) {
    const title = PLAY_TITLES[play as keyof typeof PLAY_TITLES] || play
    console.log(`${title.padEnd(32)} ${count}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })