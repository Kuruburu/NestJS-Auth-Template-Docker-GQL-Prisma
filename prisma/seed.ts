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

  const [admin, teacher, student] = await prisma.user.findMany();

  // 2️⃣ Businesses
  const businesses = await Promise.all([
    prisma.business.create({
      data: {
        name: 'ProSports Center',
        email: 'contact@prosports.com',
        phone: '123-456-789',
        ownerId: admin.id,
      },
    }),
    prisma.business.create({
      data: {
        name: 'CityPlay',
        email: 'hello@cityplay.com',
        ownerId: teacher.id,
      },
    }),
    prisma.business.create({
      data: {
        name: 'OpenCourt',
        email: 'admin@opencourt.com',
        phone: '987-654-321',
        ownerId: student.id,
      },
    }),
  ]);

  // 3️⃣ Sports
  const [football, basketball, tennis] = await Promise.all([
    prisma.sport.create({
      data: {
        name: 'Football',
        description: 'Play a match with friends on turf or grass.',
        minPlayers: 10,
        maxPlayers: 22,
      },
    }),
    prisma.sport.create({
      data: {
        name: 'Basketball',
        description: '5v5 classic streetball or indoor.',
        minPlayers: 6,
        maxPlayers: 10,
      },
    }),
    prisma.sport.create({
      data: {
        name: 'Tennis',
        description: 'Singles or doubles court play.',
        minPlayers: 2,
        maxPlayers: 4,
      },
    }),
  ]);

  // 4️⃣ Places
  const places = await Promise.all([
    prisma.place.create({
      data: {
        name: 'Central Park Fields',
        description: 'Large outdoor sports area in the city center.',
        city: 'Warsaw',
        address: 'Central Park 12',
        latitude: 52.2297,
        longitude: 21.0122,
        businessId: businesses[0].id,
      },
    }),
    prisma.place.create({
      data: {
        name: 'Downtown Arena',
        description: 'Indoor courts and gym.',
        city: 'Krakow',
        address: 'Main Street 45',
        latitude: 50.0647,
        longitude: 19.945,
        ownerId: teacher.id,
      },
    }),
    prisma.place.create({
      data: {
        name: 'Open Air Stadium',
        description: 'Perfect for weekend football games.',
        city: 'Gdansk',
        address: 'Stadium Lane 3',
        latitude: 54.352,
        longitude: 18.6466,
        businessId: businesses[2].id,
      },
    }),
  ]);

  // 5️⃣ Fields per place
  for (const place of places) {
    for (let i = 1; i <= 3; i++) {
      await prisma.field.create({
        data: {
          name: `${place.name} Field ${i}`,
          description: `Nice quality field #${i}`,
          placeId: place.id,
        },
      });
    }
  }
  const fields = await prisma.field.findMany();

  // 6️⃣ Connect fields with sports
  for (const field of fields) {
    const sports = [football, basketball, tennis];
    const randomSports = sports.sort(() => 0.5 - Math.random()).slice(0, 2);

    for (const sport of randomSports) {
      await prisma.fieldSport.create({
        data: {
          fieldId: field.id,
          sportId: sport.id,
        },
      });
    }
  }

  // 7️⃣ Activities per field
  for (const field of fields.slice(0, 3)) {
    const relatedSports = await prisma.fieldSport.findMany({
      where: { fieldId: field.id },
      include: { sport: true },
    });

    for (const rel of relatedSports) {
      const now = new Date();
      const startTime = new Date(now.getTime() + 3600000); // +1h
      const endTime = new Date(now.getTime() + 7200000); // +2h

      const activity = await prisma.activity.create({
        data: {
          fieldId: field.id,
          sportId: rel.sport.id,
          startTime,
          endTime,
          paymentRequired: true,
          price: 25.0,
          minPlayers: rel.sport.minPlayers,
          maxPlayers: rel.sport.maxPlayers,
        },
      });

      // Participants
      await prisma.activityParticipant.createMany({
        data: [
          { activityId: activity.id, userId: admin.id },
          { activityId: activity.id, userId: teacher.id },
        ],
      });

      // Payments
      await prisma.payment.create({
        data: {
          userId: admin.id,
          activityId: activity.id,
          amount: 25.0,
        },
      });
    }
  }

  console.log('✅ Seed complete!');
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
