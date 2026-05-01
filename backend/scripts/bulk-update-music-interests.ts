import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Updating all users to include "Music" in interests ---');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      interests: true,
    },
  });

  let updatedCount = 0;

  for (const user of users) {
    let currentInterests: string[] = [];

    if (user.interests) {
      try {
        // Try to parse as JSON array
        currentInterests = JSON.parse(user.interests);
        if (!Array.isArray(currentInterests)) {
          currentInterests = user.interests.split(',').map(i => i.trim());
        }
      } catch (e) {
        // Fallback to comma-separated
        currentInterests = user.interests.split(',').map(i => i.trim());
      }
    }

    // Add 'Music' if not present (case-insensitive check)
    if (!currentInterests.some(i => i.toLowerCase() === 'music')) {
      currentInterests.push('Music');
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          interests: JSON.stringify(currentInterests),
        },
      });
      updatedCount++;
    }
  }

  console.log(`--- Finished! Updated ${updatedCount} users. ---`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
