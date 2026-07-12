import { prisma } from '../lib/prisma';
import { hashPassword } from '../lib/auth';

async function main() {
  // Get a department to assign users to
  const dept = await prisma.department.findFirst({ where: { code: 'COR' } });
  if (!dept) {
    console.error('No Corporate department found. Run the seed first.');
    process.exit(1);
  }

  const users = [
    { name: 'Admin User',              email: 'admin@ecosphere.com',       password: 'password123', role: 'admin' },
    { name: 'ESG Manager',             email: 'esgmanager@ecosphere.com',  password: 'password123', role: 'esg_manager' },
    { name: 'Department Head',         email: 'depthead@ecosphere.com',    password: 'password123', role: 'department_head' },
    { name: 'Compliance Officer',      email: 'compliance@ecosphere.com',  password: 'password123', role: 'compliance_officer' },
    { name: 'Regular Employee',        email: 'employee@ecosphere.com',    password: 'password123', role: 'employee' },
  ];

  for (const u of users) {
    const existing = await prisma.employee.findUnique({ where: { email: u.email } });
    if (existing) {
      console.log(`⚠️  Skipping ${u.email} — already exists`);
      continue;
    }
    const passwordHash = await hashPassword(u.password);
    await prisma.employee.create({
      data: {
        name: u.name,
        email: u.email,
        passwordHash,
        departmentId: dept.id,
        role: u.role as any,
      },
    });
    console.log(`✅ Created: ${u.email} (${u.role})`);
  }

  console.log('\n🎉 Test users ready!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
