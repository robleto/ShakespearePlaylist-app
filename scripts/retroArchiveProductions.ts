import { prisma } from '../lib/db'
import { normalizeTitle } from '../lib/normalization/normalize'
import { CanonicalPlay } from '../lib/normalization/plays'

/*
  Softer re-normalization pass:
  - Re-run normalization on all PUBLISHED productions.
  - If a production now maps to OTHER or confidence < 0.7, archive it instead of deleting.
  - If it maps to a different canonical play with confidence >= 0.85, update the canonicalPlay.
*/
async function run() {
  const productions = await prisma.production.findMany({ where: { status: 'PUBLISHED' } })
  let archiveCount = 0
  let updateCount = 0
  for (const p of productions) {
    const { play, confidence } = normalizeTitle(p.titleRaw)
    if (play === CanonicalPlay.OTHER || confidence < 0.7) {
      await prisma.production.update({ where: { id: p.id }, data: { status: 'ARCHIVED' } })
      archiveCount++
      continue
    }
    if (play !== p.canonicalPlay && confidence >= 0.85) {
      await prisma.production.update({ where: { id: p.id }, data: { canonicalPlay: play } })
      updateCount++
    }
  }
  console.log(`Archived ${archiveCount} productions; updated canonical play for ${updateCount}.`)
}

run().catch(e=>{console.error(e);process.exit(1)})
