import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  console.log('🔍 Checking production data with sources...');
  
  const production = await prisma.production.findFirst({
    include: {
      company: {
        include: {
          sources: true
        }
      },
      venue: true,
    },
  });
  
  if (production) {
    console.log('✅ Sample production:');
    console.log('Title:', production.titleRaw);
    console.log('Company:', production.company.name);
    console.log('Sources count:', production.company.sources.length);
    if (production.company.sources.length > 0) {
      console.log('First source:', {
        url: production.company.sources[0].url,
        kind: production.company.sources[0].kind,
        parserName: production.company.sources[0].parserName
      });
    }
    console.log('Source confidence:', production.sourceConfidence);
  } else {
    console.log('❌ No productions found');
  }
  
  await prisma.$disconnect();
}

checkData().catch(console.error);
