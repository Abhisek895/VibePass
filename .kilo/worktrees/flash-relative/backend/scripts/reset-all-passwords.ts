import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/common/utils/crypto.util';

const prisma = new PrismaClient();

async function main() {
  const newPassword = 'Abhisek@2002';
  console.log(`--- Resetting all passwords to: ${newPassword} ---`);

  const hashed = hashPassword(newPassword);
  
  const result = await prisma.user.updateMany({
    data: {
      passwordHash: hashed,
    },
  });

  console.log(`--- Finished! Updated ${result.count} users. ---`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
