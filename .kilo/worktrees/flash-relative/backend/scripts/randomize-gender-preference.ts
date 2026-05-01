import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PREFERENCES = ['Women', 'Men', 'Everyone'];

async function main() {
  console.log('--- Randomizing Gender Preference for all users ---');

  const users = await prisma.user.findMany({
    select: { id: true },
  });

  let updatedCount = 0;

  for (const user of users) {
    const randomPref = PREFERENCES[Math.floor(Math.random() * PREFERENCES.length)];
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        genderPreference: randomPref,
      },
    });
    updatedCount++;
  }

  console.log(`--- Finished! Randomized preference for ${updatedCount} users. ---`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
