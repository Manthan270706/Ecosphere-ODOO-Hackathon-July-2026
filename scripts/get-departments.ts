import { prisma } from '../lib/prisma';

async function main() {
  const departments = await prisma.department.findMany({ select: { id: true, name: true } });
  console.log(JSON.stringify(departments, null, 2));
  await prisma.$disconnect();
}

main();
