import { prisma } from '../lib/prisma';

async function main() {
  const departments = await prisma.department.createMany({
    data: [
      { name: "Manufacturing", code: "MFG", employeeCount: 0, status: "active" },
      { name: "Logistics", code: "LOG", employeeCount: 0, status: "active" },
      { name: "Corporate", code: "COR", employeeCount: 0, status: "active" },
      { name: "Procurement", code: "PROC", employeeCount: 0, status: "active" },
    ],
  });

  console.log("Departments created:", departments);

  const all = await prisma.department.findMany();
  console.log("All departments:", all);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
