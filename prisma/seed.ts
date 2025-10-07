import { PrismaClient, Role, User } from '@prisma/client';
import Config from '../src/common/configs/config';
import * as bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  const createdAt = new Date();
  const updatedAt = new Date();
  const conf = Config();
  const salt = conf.security.bcryptSaltOrRound;
  const passwordHash = await bcrypt.hash('Password12#', salt);

  const userArray: Omit<User, 'id'>[] = [
    {
      firstName: 'Admin',
      lastName: 'Adminowski',
      email: 'admin@auth.com',
      passwordHash,
      role: Role.ADMIN,
      createdAt,
      updatedAt,
    },
    {
      firstName: 'Teacher',
      lastName: 'Teacherowski',
      email: 'teacher@auth.com',
      passwordHash,
      role: Role.TEACHER,
      createdAt,
      updatedAt,
    },
    {
      firstName: 'Student',
      lastName: 'Studniowski',
      email: 'student@auth.com',
      passwordHash,
      role: Role.STUDENT,
      createdAt,
      updatedAt,
    },
  ];
  await prisma.user.createMany({ data: userArray });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
