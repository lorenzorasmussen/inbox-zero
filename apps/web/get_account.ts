import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const account = await prisma.emailAccount.findFirst();
  console.log('ACCOUNT_ID:', account?.id);
}
main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
