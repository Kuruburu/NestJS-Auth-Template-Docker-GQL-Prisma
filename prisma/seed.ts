import { Prisma, PrismaClient, Role } from '@prisma/client';
import Config from '../src/common/configs/config';
import * as bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  const conf = Config();
  const salt = conf.security.bcryptSaltOrRound;
  const passwordHash = await bcrypt.hash('Password12#', salt);

  const userArray: Prisma.UserCreateManyArgs = {
    data: [
      {
        id: 'user-1',
        firstName: 'Admin',
        lastName: 'Adminowski',
        email: 'admin@auth.com',
        passwordHash,
        role: Role.ADMIN,
      },
      {
        id: 'user-2',
        firstName: 'Teacher',
        lastName: 'Teacherowski',
        email: 'teacher@auth.com',
        passwordHash,
        role: Role.TEACHER,
      },
      {
        id: 'user-3',
        firstName: 'Student',
        lastName: 'Studniowski',
        email: 'student@auth.com',
        passwordHash,
        role: Role.STUDENT,
      },
    ],
  };

  await prisma.user.createMany(userArray);
  const [admin, teacher, student] = await prisma.user.findMany();
  const businessesArray: Prisma.BusinessCreateManyArgs = {
    data: [
      {
        id: 'business-1',
        name: 'ProSports Center',
        email: 'contact@prosports.com',
        phone: '123-456-789',

        ownerId: admin.id,
      },
      {
        id: 'business-2',
        name: 'CityPlay',
        email: 'hello@cityplay.com',

        ownerId: teacher.id,
        phone: '123-456-789',
      },
      {
        id: 'business-3',
        name: 'OpenCourt',
        email: 'admin@opencourt.com',
        phone: '987-654-321',

        ownerId: student.id,
      },
    ],
  };

  await prisma.business.createMany(businessesArray);
  const sportArray: Prisma.SportCreateManyArgs = {
    data: [
      {
        id: 'sport-1',
        name: 'Football',
        description: 'Play a match with friends on turf or grass.',
        minPlayers: 10,
        maxPlayers: 22,
      },
      {
        id: 'sport-2',
        name: 'Basketball',
        description: '5v5 classic streetball or indoor.',
        minPlayers: 6,
        maxPlayers: 10,
      },
      {
        id: 'sport-3',
        name: 'Tennis',
        description: 'Singles or doubles court play.',
        minPlayers: 2,
        maxPlayers: 4,
      },
    ],
  };
  const placeArray: Prisma.PlaceCreateManyArgs = {
    data: [
      {
        id: 'place-1',
        name: 'Central Park Fields',
        description: 'Large outdoor sports area in the city center.',
        city: 'Warsaw',
        address: 'Central Park 12',
        latitude: 52.2297,
        longitude: 21.0122,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        businessId: businessesArray.data[0].id,
      },
      {
        id: 'place-2',
        name: 'Downtown Arena',
        description: 'Indoor courts and gym.',
        city: 'Krakow',
        address: 'Main Street 45',
        latitude: 50.0647,
        longitude: 19.945,

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        ownerId: userArray.data[1].id,
      },
      {
        id: 'place-3',
        name: 'Open Air Stadium',
        description: 'Perfect for weekend football games.',
        city: 'Gdansk',
        address: 'Stadium Lane 3',
        latitude: 54.352,
        longitude: 18.6466,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        businessId: businessesArray.data[1].id,
      },
    ],
  };

  await prisma.sport.createMany(sportArray);
  await prisma.place.createMany(placeArray);

  const places = await prisma.place.findMany();
  // 5️⃣ Fields per place
  for (const place of places) {
    for (let i = 1; i <= 3; i++) {
      await prisma.field.create({
        data: {
          id: `${place.id}-field-${i}`,
          name: `${place.name} Field ${i}`,
          description: `Nice quality field #${i}`,
          placeId: place.id,
        },
      });
    }
  }
  const fields = await prisma.field.findMany();

  const [football, basketball, tennis] = await prisma.sport.findMany();
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
  let activityId = 1;
  let activityParticipantId = 1;
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
          id: `activity-${activityId}`,
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
      activityId += 1;

      // Participants
      // await prisma.activityParticipant.createMany({
      //   data: [
      //     { activityId: activity.id, userId: admin.id },
      //     { activityId: activity.id, userId: teacher.id },
      //   ],
      // });

      await prisma.activityParticipant.createMany({
        data: [
          { id: `activity-participant-${activityParticipantId}`, activityId: activity.id, userId: admin.id },
          { id: `activity-participant-${activityParticipantId + 1}`, activityId: activity.id, userId: teacher.id },
        ],
      });
      activityParticipantId += 2;

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
