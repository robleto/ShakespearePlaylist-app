import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function approveAllReviewProductions() {
  try {
    console.log('🔄 Updating all REVIEW productions to PUBLISHED...');
    
    const result = await prisma.production.updateMany({
      where: {
        status: 'REVIEW'
      },
      data: {
        status: 'PUBLISHED'
      }
    });
    
    console.log(`✅ Successfully updated ${result.count} productions to PUBLISHED status`);
    
    // Verify the update
    const statusCounts = await prisma.production.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });
    
    console.log('\n📊 Updated production counts by status:');
    statusCounts.forEach(({ status, _count }) => {
      console.log(`  ${status}: ${_count.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating productions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

approveAllReviewProductions();
