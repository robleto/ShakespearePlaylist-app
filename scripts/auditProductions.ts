import { prisma } from '../lib/db'

async function main() {
  const low = await prisma.production.findMany({
    where: { sourceConfidence: { lt: 0.85 }, status: 'REVIEW' },
    include: { company: true },
    orderBy: { createdAt: 'desc' },
  })
  if (low.length === 0) {
    console.log('No low-confidence REVIEW productions found.')
    return
  }
  console.log(`Low-confidence REVIEW productions (${low.length}):`)
  for (const p of low) {
    console.log(`- ${p.titleRaw} (${p.canonicalPlay}) @ ${p.company.name} conf=${p.sourceConfidence.toFixed(2)}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })