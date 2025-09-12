import { prisma } from '../lib/db'
import { normalizeTitle } from '../lib/normalization/normalize'
import { PLAY_TITLES, CanonicalPlay, DEFAULT_ALIASES } from '../lib/normalization/plays'

/*
  Re-evaluate existing published productions' titleRaw with the current normalization logic.
  If they now classify as OTHER or confidence < 0.7, delete them (noise cleanup).
  If they map to a different canonical play with confidence >= 0.85 and different from stored, update the canonicalPlay.
*/
async function run() {
  const productions = await prisma.production.findMany({ where: { status: 'PUBLISHED' } })
  const toDelete: string[] = []
  const toUpdate: { id: string; canonicalPlay: CanonicalPlay }[] = []
  for (const p of productions) {
    const { play, confidence } = normalizeTitle(p.titleRaw)
    if (play === CanonicalPlay.OTHER || confidence < 0.7) {
      toDelete.push(p.id)
      continue
    }
    if (play !== p.canonicalPlay && confidence >= 0.85) {
      toUpdate.push({ id: p.id, canonicalPlay: play })
    }
  }
  console.log(`Will delete ${toDelete.length} noise productions; update ${toUpdate.length} canonical mismatches.`)
  if (toDelete.length) {
    await prisma.production.deleteMany({ where: { id: { in: toDelete } } })
  }
  for (const u of toUpdate) {
    await prisma.production.update({ where: { id: u.id }, data: { canonicalPlay: u.canonicalPlay } })
  }
  console.log('Cleanup complete.')
}

run().catch(e => { console.error(e); process.exit(1) })
