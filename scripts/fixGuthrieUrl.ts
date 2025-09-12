import { prisma } from '@/lib/db'

async function main() {
  const company = await prisma.company.findFirst({ where: { name: { contains: 'Guthrie', mode: 'insensitive' } } })
  if (!company) {
    console.log('Guthrie Theater company not found')
    return
  }
  const correct = 'https://www.guthrietheater.org'
  if (company.website === correct) {
    console.log('Already correct')
    return
  }
  await prisma.company.update({ where: { id: company.id }, data: { website: correct } })
  console.log(`Updated Guthrie website to ${correct}`)
}

main().catch(e=>{ console.error(e); process.exit(1) }).finally(()=>prisma.$disconnect())
