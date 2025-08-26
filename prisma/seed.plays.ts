import { PrismaClient, CanonicalPlay } from '@prisma/client'

const prisma = new PrismaClient()

// Basic canonical data set for Shakespeare plays (can expand later)
// Categories chosen loosely (comedies, tragedies, histories, romances/late plays)
// Some classification debates exist; we keep a pragmatic grouping.
type PlayDef = {
  play: CanonicalPlay
  title: string
  slug: string
  abbrev?: string
  categories: string[]
  altTitles?: string[]
  isApocrypha?: boolean
}

const PLAY_DEFS: PlayDef[] = [
  { play: CanonicalPlay.ALL_S_WELL_THAT_ENDS_WELL, title: "All's Well That Ends Well", slug: 'alls-well-that-ends-well', abbrev: 'AWW', categories: ['COMEDY'] },
  { play: CanonicalPlay.ANTONY_AND_CLEOPATRA, title: 'Antony and Cleopatra', slug: 'antony-and-cleopatra', abbrev: 'A&C', categories: ['TRAGEDY'] },
  { play: CanonicalPlay.AS_YOU_LIKE_IT, title: 'As You Like It', slug: 'as-you-like-it', abbrev: 'AYLI', categories: ['COMEDY'] },
  { play: CanonicalPlay.COMEDY_OF_ERRORS, title: 'The Comedy of Errors', slug: 'comedy-of-errors', abbrev: 'CoE', categories: ['COMEDY'] },
  { play: CanonicalPlay.CORIOLANUS, title: 'Coriolanus', slug: 'coriolanus', abbrev: 'Cor', categories: ['TRAGEDY'] },
  { play: CanonicalPlay.CYMBELINE, title: 'Cymbeline', slug: 'cymbeline', abbrev: 'Cym', categories: ['ROMANCE','LATE'] },
  { play: CanonicalPlay.HAMLET, title: 'Hamlet', slug: 'hamlet', abbrev: 'Ham', categories: ['TRAGEDY'] },
  { play: CanonicalPlay.HENRY_IV_PART_1, title: 'Henry IV, Part 1', slug: 'henry-iv-part-1', abbrev: 'H4P1', categories: ['HISTORY'] },
  { play: CanonicalPlay.HENRY_IV_PART_2, title: 'Henry IV, Part 2', slug: 'henry-iv-part-2', abbrev: 'H4P2', categories: ['HISTORY'] },
  { play: CanonicalPlay.HENRY_V, title: 'Henry V', slug: 'henry-v', abbrev: 'H5', categories: ['HISTORY'] },
  { play: CanonicalPlay.HENRY_VI_PART_1, title: 'Henry VI, Part 1', slug: 'henry-vi-part-1', abbrev: 'H6P1', categories: ['HISTORY'] },
  { play: CanonicalPlay.HENRY_VI_PART_2, title: 'Henry VI, Part 2', slug: 'henry-vi-part-2', abbrev: 'H6P2', categories: ['HISTORY'] },
  { play: CanonicalPlay.HENRY_VI_PART_3, title: 'Henry VI, Part 3', slug: 'henry-vi-part-3', abbrev: 'H6P3', categories: ['HISTORY'] },
  { play: CanonicalPlay.HENRY_VIII, title: 'Henry VIII', slug: 'henry-viii', abbrev: 'H8', categories: ['HISTORY'] },
  { play: CanonicalPlay.JULIUS_CAESAR, title: 'Julius Caesar', slug: 'julius-caesar', abbrev: 'JC', categories: ['TRAGEDY'] },
  { play: CanonicalPlay.KING_JOHN, title: 'King John', slug: 'king-john', abbrev: 'KJ', categories: ['HISTORY'] },
  { play: CanonicalPlay.KING_LEAR, title: 'King Lear', slug: 'king-lear', abbrev: 'KL', categories: ['TRAGEDY'] },
  { play: CanonicalPlay.LOVE_S_LABOUR_S_LOST, title: "Love's Labour's Lost", slug: 'loves-labours-lost', abbrev: 'LLL', categories: ['COMEDY'] },
  { play: CanonicalPlay.MACBETH, title: 'Macbeth', slug: 'macbeth', abbrev: 'Mac', categories: ['TRAGEDY'] },
  { play: CanonicalPlay.MEASURE_FOR_MEASURE, title: 'Measure for Measure', slug: 'measure-for-measure', abbrev: 'MFM', categories: ['COMEDY'] },
  { play: CanonicalPlay.MERCHANT_OF_VENICE, title: 'The Merchant of Venice', slug: 'merchant-of-venice', abbrev: 'MoV', categories: ['COMEDY'] },
  { play: CanonicalPlay.MERRY_WIVES_OF_WINDSOR, title: 'The Merry Wives of Windsor', slug: 'merry-wives-of-windsor', abbrev: 'MWoW', categories: ['COMEDY'] },
  { play: CanonicalPlay.MIDSUMMER_NIGHT_S_DREAM, title: "A Midsummer Night's Dream", slug: 'midsummer-nights-dream', abbrev: 'MND', categories: ['COMEDY'] },
  { play: CanonicalPlay.MUCH_ADO_ABOUT_NOTHING, title: 'Much Ado About Nothing', slug: 'much-ado-about-nothing', abbrev: 'MAAN', categories: ['COMEDY'] },
  { play: CanonicalPlay.OTHELLO, title: 'Othello', slug: 'othello', abbrev: 'Oth', categories: ['TRAGEDY'] },
  { play: CanonicalPlay.RICHARD_II, title: 'Richard II', slug: 'richard-ii', abbrev: 'R2', categories: ['HISTORY'] },
  { play: CanonicalPlay.RICHARD_III, title: 'Richard III', slug: 'richard-iii', abbrev: 'R3', categories: ['HISTORY'] },
  { play: CanonicalPlay.ROMEO_AND_JULIET, title: 'Romeo and Juliet', slug: 'romeo-and-juliet', abbrev: 'R&J', categories: ['TRAGEDY'] },
  { play: CanonicalPlay.TAMING_OF_THE_SHREW, title: 'The Taming of the Shrew', slug: 'taming-of-the-shrew', abbrev: 'TotS', categories: ['COMEDY'] },
  { play: CanonicalPlay.TEMPEST, title: 'The Tempest', slug: 'the-tempest', abbrev: 'Tmp', categories: ['ROMANCE','LATE'] },
  { play: CanonicalPlay.TIMON_OF_ATHENS, title: 'Timon of Athens', slug: 'timon-of-athens', abbrev: 'Tim', categories: ['TRAGEDY'] },
  { play: CanonicalPlay.TITUS_ANDRONICUS, title: 'Titus Andronicus', slug: 'titus-andronicus', abbrev: 'Tit', categories: ['TRAGEDY'] },
  { play: CanonicalPlay.TROILUS_AND_CRESSIDA, title: 'Troilus and Cressida', slug: 'troilus-and-cressida', abbrev: 'T&C', categories: ['TRAGEDY'] },
  { play: CanonicalPlay.TWELFTH_NIGHT, title: 'Twelfth Night', slug: 'twelfth-night', abbrev: 'TN', categories: ['COMEDY'] },
  { play: CanonicalPlay.TWO_GENTLEMEN_OF_VERONA, title: 'The Two Gentlemen of Verona', slug: 'two-gentlemen-of-verona', abbrev: 'TGV', categories: ['COMEDY'] },
  { play: CanonicalPlay.WINTER_S_TALE, title: "The Winter's Tale", slug: 'winters-tale', abbrev: 'WT', categories: ['ROMANCE','LATE'] },
  { play: CanonicalPlay.PERICLES, title: 'Pericles', slug: 'pericles', abbrev: 'Per', categories: ['ROMANCE','LATE'] },
  { play: CanonicalPlay.EDWARD_III, title: 'Edward III', slug: 'edward-iii', abbrev: 'E3', categories: ['HISTORY'], isApocrypha: true },
  { play: CanonicalPlay.TWO_NOBLE_KINSMEN, title: 'The Two Noble Kinsmen', slug: 'two-noble-kinsmen', abbrev: '2NK', categories: ['ROMANCE','LATE'], isApocrypha: true },
]

async function main() {
  console.log('🌱 Seeding plays...')
  for (const def of PLAY_DEFS) {
    await prisma.play.upsert({
      where: { canonicalPlay: def.play },
      update: {
        slug: def.slug,
        title: def.title,
        abbrev: def.abbrev,
        categories: def.categories as any,
        altTitles: def.altTitles || [],
        isApocrypha: !!def.isApocrypha,
      },
      create: {
        canonicalPlay: def.play,
        slug: def.slug,
        title: def.title,
        abbrev: def.abbrev,
        categories: def.categories as any,
        altTitles: def.altTitles || [],
        isApocrypha: !!def.isApocrypha,
      },
    })
  }
  console.log(`✅ Seeded/updated ${PLAY_DEFS.length} plays.`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    return prisma.$disconnect().finally(() => process.exit(1))
  })
