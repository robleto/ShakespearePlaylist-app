import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkProductions() {
  console.log('🔍 Checking production statuses...')
  
  const statusCounts = await prisma.production.groupBy({
    by: ['status'],
    _count: { _all: true }
  })
  
  console.log('Production counts by status:')
  statusCounts.forEach(s => {
    console.log(`  ${s.status}: ${s._count._all}`)
  })
  
  console.log('\n📊 Sample productions:')
  const sample = await prisma.production.findMany({
    take: 5,
    include: { company: true },
    orderBy: { createdAt: 'desc' }
  })
  
  sample.forEach(p => {
    console.log(`  ${p.status} | ${p.company.name} | ${p.titleRaw} | confidence: ${p.sourceConfidence}`)
  })
  
  await prisma.$disconnect()
}

checkProductions().catch(console.error)
