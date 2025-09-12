import { prisma } from '../lib/db'

async function main() {
  const total = await prisma.production.count({ where: { canonicalPlay: 'OTHER' } })
  if (total === 0) {
    console.log('No OTHER productions to remove.')
    return
  }
  const deleted = await prisma.production.deleteMany({ where: { canonicalPlay: 'OTHER' } })
  console.log(`Deleted ${deleted.count} non-Shakespeare (OTHER) productions.`)
}

main().catch(e => { console.error(e); process.exit(1) })