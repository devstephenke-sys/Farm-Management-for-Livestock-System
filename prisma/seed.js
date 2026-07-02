require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const bcrypt = require('bcryptjs');

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Cleanup existing data
  console.log('Cleaning up existing database records...');
  await prisma.workerTask.deleteMany({});
  await prisma.worker.deleteMany({});
  await prisma.scheduleEvent.deleteMany({});
  await prisma.inventoryItem.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.learningResource.deleteMany({});
  await prisma.productionRecord.deleteMany({});
  await prisma.breedingRecord.deleteMany({});
  await prisma.healthRecord.deleteMany({});
  await prisma.animal.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.farm.deleteMany({});
  await prisma.user.deleteMany({});

  // Hash passwords
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const farmerPasswordHash = await bcrypt.hash('farmer123', 10);
  const vetPasswordHash = await bcrypt.hash('vet123', 10);
  const vet2PasswordHash = await bcrypt.hash('vet456', 10);

  // 1. Create Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@farm.com' },
    update: {},
    create: {
      email: 'admin@farm.com',
      passwordHash: adminPasswordHash,
      name: 'System Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
      phone: '+254700000000',
    },
  });

  const farmer = await prisma.user.upsert({
    where: { email: 'farmer@farm.com' },
    update: {},
    create: {
      email: 'farmer@farm.com',
      passwordHash: farmerPasswordHash,
      name: 'John Doe',
      role: 'FARMER',
      status: 'ACTIVE',
      phone: '+254711111111',
      county: 'Nakuru',
      subCounty: 'Nakuru East',
    },
  });

  const vet = await prisma.user.upsert({
    where: { email: 'vet@farm.com' },
    update: {},
    create: {
      email: 'vet@farm.com',
      passwordHash: vetPasswordHash,
      name: 'Dr. Jane Smith',
      role: 'VET',
      status: 'ACTIVE', // Approved
      licenseNumber: 'KVB-2026-894',
      qualification: 'Bachelor of Veterinary Medicine (BVM)',
      specialization: 'Cattle & Goats',
      county: 'Nakuru',
      subCounty: 'Nakuru East',
      phone: '+254722222222',
    },
  });

  const vet2 = await prisma.user.upsert({
    where: { email: 'vet2@farm.com' },
    update: {},
    create: {
      email: 'vet2@farm.com',
      passwordHash: vet2PasswordHash,
      name: 'Dr. David Kimani',
      role: 'VET',
      status: 'PENDING', // Awaiting admin approval
      licenseNumber: 'KVB-2025-112',
      qualification: 'Diploma in Animal Health',
      specialization: 'Poultry & Pigs',
      county: 'Uasin Gishu',
      subCounty: 'Eldoret East',
      phone: '+254733333333',
    },
  });

  console.log('Users seeded:', { admin: admin.email, farmer: farmer.email, vet: vet.email, pendingVet: vet2.email });

  // 2. Create Farmer's Farm
  const farm = await prisma.farm.create({
    data: {
      name: 'Highlands Dairy & Livestock Farm',
      ownerName: 'John Doe',
      email: 'farmer@farm.com',
      phone: '+254711111111',
      county: 'Nakuru',
      subCounty: 'Nakuru East',
      ward: 'Biashara',
      gpsLocation: '-0.2833, 36.0667',
      farmerId: farmer.id,
    },
  });

  console.log('Farm seeded:', farm.name);

  // 3. Create Subscription for Farmer (Standard Plan, ends in 30 days)
  const subscription = await prisma.subscription.create({
    data: {
      farmerId: farmer.id,
      plan: 'STANDARD',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      amountPaid: 1500.0,
    },
  });

  console.log('Subscription seeded:', subscription.plan);

  // 4. Create Animals
  const bessie = await prisma.animal.create({
    data: {
      tagNumber: 'COW-001',
      name: 'Bessie',
      type: 'COW',
      breed: 'Friesian',
      gender: 'FEMALE',
      dob: new Date('2022-03-15'),
      color: 'Black and White',
      weight: 450.5,
      farmId: farm.id,
      purchaseDate: new Date('2023-01-10'),
      purchaseCost: 85000.0,
      status: 'ACTIVE',
    },
  });

  const billy = await prisma.animal.create({
    data: {
      tagNumber: 'GOT-002',
      name: 'Billy',
      type: 'GOAT',
      breed: 'Toggenburg',
      gender: 'MALE',
      dob: new Date('2023-06-20'),
      color: 'Brown and White',
      weight: 45.0,
      farmId: farm.id,
      status: 'ACTIVE',
    },
  });

  const henny = await prisma.animal.create({
    data: {
      tagNumber: 'PLT-003',
      name: 'Henny',
      type: 'POULTRY',
      breed: 'Kuroiler',
      gender: 'FEMALE',
      dob: new Date('2024-01-05'),
      color: 'Red-brown speckled',
      weight: 2.1,
      farmId: farm.id,
      status: 'ACTIVE',
    },
  });

  console.log('Animals seeded:', [bessie.tagNumber, billy.tagNumber, henny.tagNumber]);

  // 5. Create Animal History Logs (Health records)
  await prisma.healthRecord.create({
    data: {
      animalId: bessie.id,
      type: 'VACCINATION',
      title: 'Foot and Mouth Vaccine',
      date: new Date('2026-02-10'),
      notes: 'Routine vaccination, next due in 6 months.',
      cost: 1200.0,
    },
  });

  await prisma.healthRecord.create({
    data: {
      animalId: bessie.id,
      type: 'TREATMENT',
      title: 'Deworming',
      date: new Date('2026-05-01'),
      notes: 'Administered Albendazole.',
      cost: 500.0,
    },
  });

  // 6. Create Breeding Record (Mating & Pregnancy Check)
  await prisma.breedingRecord.create({
    data: {
      animalId: bessie.id,
      type: 'ARTIFICIAL_INSEMINATION',
      date: new Date('2026-04-10'),
      details: 'AI with Friesian Sire Superior Semen.',
      result: 'SUCCESS',
      nextActionDate: new Date('2026-06-10'), // Pregnancy check date
    },
  });

  await prisma.breedingRecord.create({
    data: {
      animalId: bessie.id,
      type: 'PREGNANCY_CHECK',
      date: new Date('2026-06-10'),
      details: 'Palpation confirmed pregnant.',
      result: 'PREGNANT',
      nextActionDate: new Date('2027-01-15'), // Calving date
    },
  });

  // 7. Create Production Records
  // Daily milk yields for Bessie (recent 3 days)
  for (let i = 1; i <= 3; i++) {
    await prisma.productionRecord.create({
      data: {
        animalId: bessie.id,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        milkYield: 18.5 + (i * 0.5), // Liters
        notes: 'Morning + Evening milking',
      },
    });
  }

  // Egg production for Henny (recent 3 days)
  for (let i = 1; i <= 3; i++) {
    await prisma.productionRecord.create({
      data: {
        animalId: henny.id,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        eggCount: 1, // Egg per day
        notes: 'Laid normal sized egg',
      },
    });
  }

  console.log('Production & Health logs seeded.');

  // 8. Create a Veterinary Appointment
  const appointment = await prisma.appointment.create({
    data: {
      farmerId: farmer.id,
      veterinarianId: vet.id,
      animalId: billy.id,
      preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // In 2 days
      urgency: 'MEDIUM',
      status: 'PENDING',
      symptoms: 'Loss of appetite, slight diarrhea, and lethargy.',
      county: 'Nakuru',
      subCounty: 'Nakuru East',
      specialization: 'Cattle & Goats',
    },
  });

  console.log('Appointment seeded:', appointment.id);

  // 9. Seed Public Learning Center Resources (category + module structure)
  const learningSeed = [
    { title: 'Dairy Cattle Feeding Basics', category: 'CATTLE', module: 'FEEDING', contentType: 'VIDEO', contentUrl: 'https://www.youtube.com/embed/8VjJpvd83qY', contentBody: 'Learn roughage-to-concentrate ratios, water requirements, and daily dry matter intake for Kenyan dairy herds.' },
    { title: 'Cattle Vaccination Schedule Kenya', category: 'CATTLE', module: 'VACCINATION', contentType: 'ARTICLE', contentBody: 'Annual FMD and CBPP vaccines. Calves: first FMD at 3 months, booster at 6 months. Deworm every 3 months in wet season.' },
    { title: 'Common Cattle Diseases', category: 'CATTLE', module: 'DISEASES', contentType: 'VIDEO', contentUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ', contentBody: 'East Coast Fever, mastitis, and tick-borne diseases — symptoms, prevention, and when to call a vet.' },
    { title: 'Artificial Insemination for Cattle', category: 'CATTLE', module: 'BREEDING', contentType: 'ARTICLE', contentBody: 'Heat detection signs, AI timing (12-18 hours after standing heat), and pregnancy confirmation at 60-90 days.' },
    { title: 'Dairy Cattle Housing Design', category: 'CATTLE', module: 'HOUSING', contentType: 'ARTICLE', contentBody: 'Zero-grazing units need 3.5m x 2.4m per cow, good drainage, and separate milking parlor with clean concrete floors.' },
    { title: 'Goat Feeding & Nutrition', category: 'GOAT', module: 'FEEDING', contentType: 'VIDEO', contentUrl: 'https://www.youtube.com/embed/0e3GPea1Tyg', contentBody: 'Browse species, mineral blocks, and supplementary feeding for pregnant does and growing kids.' },
    { title: 'Goat Vaccination Guide', category: 'GOAT', module: 'VACCINATION', contentType: 'ARTICLE', contentBody: 'CCPP annually, PPR every 3 years, enterotoxemia before kidding. Kids vaccinated at 8-12 weeks.' },
    { title: 'Goat Disease Prevention', category: 'GOAT', module: 'DISEASES', contentType: 'VIDEO', contentUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4', contentBody: 'PPR, CCPP, foot rot, and internal parasites — practical prevention for smallholder goat farms.' },
    { title: 'Goat Breeding Management', category: 'GOAT', module: 'BREEDING', contentType: 'ARTICLE', contentBody: 'Buck-to-doe ratio 1:25, kidding intervals, and record-keeping for pedigree selection.' },
    { title: 'Goat Housing & Shelter', category: 'GOAT', module: 'HOUSING', contentType: 'ARTICLE', contentBody: 'Raised slatted floors, 1.5m² per adult goat, separate kidding pens, and rain-proof roofing.' },
    { title: 'Sheep Feeding Programs', category: 'SHEEP', module: 'FEEDING', contentType: 'ARTICLE', contentBody: 'Pasture rotation, hay storage, and concentrate supplementation during late pregnancy.' },
    { title: 'Sheep Vaccination Schedule', category: 'SHEEP', module: 'VACCINATION', contentType: 'ARTICLE', contentBody: 'Clostridial vaccines (bluetongue, pulpy kidney), annual FMD in endemic areas, and tetanus at docking.' },
    { title: 'Sheep Common Diseases', category: 'SHEEP', module: 'DISEASES', contentType: 'ARTICLE', contentBody: 'Foot rot, internal parasites, and orf — identification and flock management strategies.' },
    { title: 'Sheep Breeding & Lambing', category: 'SHEEP', module: 'BREEDING', contentType: 'ARTICLE', contentBody: 'Flushing before mating, gestation length (147 days), and lambing pen preparation.' },
    { title: 'Sheep Housing Requirements', category: 'SHEEP', module: 'HOUSING', contentType: 'ARTICLE', contentBody: 'Open-sided shelters, dry bedding, and predator-proof fencing for night housing.' },
    { title: 'Poultry Feeding Guide', category: 'POULTRY', module: 'FEEDING', contentType: 'VIDEO', contentUrl: 'https://www.youtube.com/embed/WPPPFqsECz0', contentBody: 'Starter, grower, and layer mash schedules. Calcium for layers, clean water always available.' },
    { title: 'Poultry Vaccination Program', category: 'POULTRY', module: 'VACCINATION', contentType: 'ARTICLE', contentBody: 'Newcastle disease (eye drop at day 1, booster at 2 and 6 weeks), Gumboro, and fowl pox at 8 weeks.' },
    { title: 'Poultry Disease Management', category: 'POULTRY', module: 'DISEASES', contentType: 'VIDEO', contentUrl: 'https://www.youtube.com/embed/1Ne1hqOXKKI', contentBody: 'Newcastle, coccidiosis, and respiratory infections — biosecurity and early detection.' },
    { title: 'Poultry Housing Design', category: 'POULTRY', module: 'HOUSING', contentType: 'ARTICLE', contentBody: 'Deep litter system, 1 bird per 0.1m², ventilation, and separate brooder for chicks.' },
    { title: 'Pig Feeding & Growth', category: 'PIG', module: 'FEEDING', contentType: 'ARTICLE', contentBody: 'Creep feed at 2 weeks, grower rations, and feed conversion targets for commercial pig production.' },
    { title: 'Pig Vaccination Schedule', category: 'PIG', module: 'VACCINATION', contentType: 'ARTICLE', contentBody: 'Iron injection at day 1-3, erysipelas at 6-8 weeks, and ASF biosecurity protocols.' },
    { title: 'Pig Disease Prevention', category: 'PIG', module: 'DISEASES', contentType: 'VIDEO', contentUrl: 'https://www.youtube.com/embed/OPf0YbXqDm0', contentBody: 'African Swine Fever awareness, respiratory diseases, and parasite control in pig units.' },
    { title: 'Pig Breeding Management', category: 'PIG', module: 'BREEDING', contentType: 'ARTICLE', contentBody: 'Heat detection (21-day cycle), gestation (114 days), and farrowing pen preparation.' },
    { title: 'Modern Pig Housing', category: 'PIG', module: 'HOUSING', contentType: 'VIDEO', contentUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', contentBody: 'Farrowing crates, drainage slopes, and ventilation for tropical pig housing units.' },
    { title: 'Rabbit Feeding Guide', category: 'RABBIT', module: 'FEEDING', contentType: 'ARTICLE', contentBody: 'Hay, pellets, and fresh greens. Avoid sudden diet changes. Pregnant does need extra protein.' },
    { title: 'Rabbit Health & Vaccination', category: 'RABBIT', module: 'VACCINATION', contentType: 'ARTICLE', contentBody: 'Myxomatosis and RHD vaccination where available. Deworming every 3 months.' },
    { title: 'Rabbit Common Diseases', category: 'RABBIT', module: 'DISEASES', contentType: 'ARTICLE', contentBody: 'Snuffles, coccidiosis, and sore hocks — cage hygiene and early treatment.' },
    { title: 'Rabbit Housing Setup', category: 'RABBIT', module: 'HOUSING', contentType: 'ARTICLE', contentBody: 'Wire cages 0.5m x 0.6m per adult, shade from direct sun, and separate nesting boxes for does.' },
  ];

  for (const item of learningSeed) {
    await prisma.learningResource.create({
      data: { ...item, authorId: admin.id },
    });
  }

  console.log('Learning resources seeded:', learningSeed.length);

  // 10. Seed Notifications
  await prisma.notification.create({
    data: {
      userId: farmer.id,
      title: 'Deworming Due soon',
      message: 'Deworming for Bessie (COW-001) is scheduled for next week.',
      type: 'DEWORMING',
      animalId: bessie.id,
    },
  });

  await prisma.notification.create({
    data: {
      userId: farmer.id,
      title: 'Pregnancy Check Complete',
      message: 'Bessie (COW-001) has been marked as Pregnant.',
      type: 'PREGNANCY_CHECK',
      animalId: bessie.id,
    },
  });

  console.log('Notifications seeded.');

  // 11. Seed Transactions
  await prisma.transaction.createMany({
    data: [
      {
        farmId: farm.id,
        type: 'INCOME',
        category: 'MILK_SALES',
        amount: 14500.0,
        description: 'Morning milking sales to Cooperatives',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        farmId: farm.id,
        type: 'INCOME',
        category: 'MILK_SALES',
        amount: 12000.0,
        description: 'Evening milking sales',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        farmId: farm.id,
        type: 'INCOME',
        category: 'ANIMAL_SALES',
        amount: 8000.0,
        description: 'Sold male kid goat',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        farmId: farm.id,
        type: 'EXPENSE',
        category: 'FEED',
        amount: 45000.0,
        description: 'Purchased 18 bags of Dairy Meal feed concentrates',
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        farmId: farm.id,
        type: 'EXPENSE',
        category: 'VET_SERVICES',
        amount: 1500.0,
        description: 'Dr. Jane Smith consulting fee for vaccine visit',
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        farmId: farm.id,
        type: 'EXPENSE',
        category: 'TRANSPORT',
        amount: 2200.0,
        description: 'Transport of dairy meal bags from local supplier',
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // 12. Seed InventoryItems
  await prisma.inventoryItem.createMany({
    data: [
      {
        farmId: farm.id,
        name: 'Dairy Meal Concentrates',
        category: 'FEED',
        quantity: 15.0,
        unit: 'bags',
        lowStockThreshold: 5.0,
        supplier: 'Chapa Elgon Feeds Ltd',
        cost: 2500.0,
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
      },
      {
        farmId: farm.id,
        name: 'FMD Vaccination Vials',
        category: 'VACCINE',
        quantity: 2.0,
        unit: 'vials',
        lowStockThreshold: 1.0,
        supplier: 'VetCare East Africa',
        cost: 3200.0,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 2 months
      },
      {
        farmId: farm.id,
        name: 'Albendazole Dewormer',
        category: 'DRUG',
        quantity: 0.0,
        unit: 'bottles',
        lowStockThreshold: 2.0,
        supplier: 'Coop Vet Agrovet',
        cost: 950.0,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
      {
        farmId: farm.id,
        name: 'Milking Machine Spares',
        category: 'EQUIPMENT',
        quantity: 4.0,
        unit: 'units',
        lowStockThreshold: 1.0,
        supplier: 'Delaval Kenya',
        cost: 15000.0,
        expiryDate: null,
      },
    ],
  });

  // 13. Seed ScheduleEvents
  await prisma.scheduleEvent.createMany({
    data: [
      {
        farmId: farm.id,
        animalId: bessie.id,
        type: 'VACCINATION',
        title: 'FMD vaccination booster shot',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // In 5 days
        completed: false,
        notes: 'Booster shot to prevent Foot and Mouth Disease outbreak.',
      },
      {
        farmId: farm.id,
        animalId: billy.id,
        type: 'DEWORMING',
        title: 'Deworming schedule - Albendazole',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // In 2 days
        completed: false,
        notes: 'Administer 15ml oral solution.',
      },
      {
        farmId: farm.id,
        animalId: bessie.id,
        type: 'OTHER',
        title: 'Pregnancy Check via Palpation',
        dueDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        completed: true,
        completedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        notes: 'Confirmed pregnant by Dr. Jane Smith.',
      },
    ],
  });

  // 14. Seed Workers & WorkerTasks
  const worker1 = await prisma.worker.create({
    data: {
      farmId: farm.id,
      name: 'Jane Mwangi',
      role: 'Milker & Feeder',
      phone: '+254712345678',
      status: 'ACTIVE',
    },
  });

  const worker2 = await prisma.worker.create({
    data: {
      farmId: farm.id,
      name: 'Peter Njoroge',
      role: 'Herdsman',
      phone: '+254787654321',
      status: 'ACTIVE',
    },
  });

  await prisma.workerTask.createMany({
    data: [
      {
        farmId: farm.id,
        workerId: worker1.id,
        taskName: 'Milking Bessie (Morning & Evening)',
        description: 'Sterilize equipment, sanitize udders, measure yields, log in system.',
        status: 'COMPLETED',
        dueDate: new Date(),
        completedAt: new Date(),
      },
      {
        farmId: farm.id,
        workerId: worker2.id,
        taskName: 'Clean Goat and Pig Pens',
        description: 'Shovel manure, disinfect floors, inspect for pests, replace bedding.',
        status: 'PENDING',
        dueDate: new Date(),
      },
      {
        farmId: farm.id,
        workerId: worker1.id,
        taskName: 'Distribute Concentrate Feeds',
        description: 'Provide 2kg dairy meal concentrates per dairy cattle in milking bays.',
        status: 'PENDING',
        dueDate: new Date(),
      },
    ],
  });

  console.log('FMS Upgrade Seed Data loaded successfully!');
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
