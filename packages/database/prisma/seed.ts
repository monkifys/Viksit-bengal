import { PrismaClient, Role, PromiseStatus, Confidence, SourceType, SourceTier, Scenario } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Viksit Bengal database...');

  const seedDataPath = path.join(__dirname, 'seed-data.json');
  const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));

  // 1. Seed Default Users
  console.log('Seeding users...');
  const userMap = new Map<string, any>();
  const usersToSeed = seedData.users || [
    { email: 'admin@viksitbengal.gov.in', password: 'Admin@123', name: 'State Administrator', role: 'ADMIN' },
    { email: 'researcher@viksitbengal.gov.in', password: 'Researcher@123', name: 'Policy Researcher', role: 'RESEARCHER' },
    { email: 'citizen@viksitbengal.gov.in', password: 'Citizen@123', name: 'Citizen Observer', role: 'PUBLIC' },
  ];

  for (const u of usersToSeed) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role as Role,
        password: hashedPassword,
      },
      create: {
        email: u.email,
        name: u.name,
        role: u.role as Role,
        password: hashedPassword,
      },
    });
    userMap.set(u.email, user);
  }
  console.log(`Seeded ${usersToSeed.length} users (Admin, Researcher, Public).`);

  const adminUser = userMap.get('admin@viksitbengal.gov.in') || await prisma.user.findFirst();

  // 2. Seed Government Period
  if (seedData.governmentPeriod) {
    await prisma.governmentPeriod.deleteMany();
    await prisma.governmentPeriod.create({
      data: {
        chiefMinister: seedData.governmentPeriod.chiefMinister,
        partyName: seedData.governmentPeriod.partyName,
        oathDate: new Date(seedData.governmentPeriod.oathDate),
        termEndDate: new Date(seedData.governmentPeriod.termEndDate),
        seatsWon: seedData.governmentPeriod.seatsWon,
        totalSeats: seedData.governmentPeriod.totalSeats,
        governor: seedData.governmentPeriod.governor,
        oathVenue: seedData.governmentPeriod.oathVenue,
      },
    });
    console.log('Seeded Government Period.');
  }

  // 3. Seed GSDP Targets
  if (seedData.gsdpTargets) {
    await prisma.gsdpTarget.deleteMany();
    for (const target of seedData.gsdpTargets) {
      const scenarioKey = target.scenario.toUpperCase();
      await prisma.gsdpTarget.create({
        data: {
          scenario: scenarioKey as Scenario,
          baseYear: target.baseYear,
          baseGdpInr: target.baseGdpInrLakhCrore,
          targetYear: target.targetYear,
          targetGdpUsd: target.targetGdpUsdBillion,
          growthRate: target.assumedGrowthRate,
          exchangeRate: target.assumedExchangeRate,
          notes: target.notes,
        },
      });
    }
    console.log(`Seeded ${seedData.gsdpTargets.length} GSDP Targets.`);
  }

  // 4. Seed Districts (All 23)
  console.log('Seeding all 23 districts...');
  const districtMap = new Map<string, any>();
  if (seedData.districts) {
    for (const d of seedData.districts) {
      const district = await prisma.district.upsert({
        where: { code: d.code },
        update: {
          nameEn: d.nameEn,
          nameBn: d.nameBn,
          population: d.population,
          area: d.area,
        },
        create: {
          code: d.code,
          nameEn: d.nameEn,
          nameBn: d.nameBn,
          population: d.population,
          area: d.area,
        },
      });
      districtMap.set(d.code, district);
    }
    console.log(`Seeded ${seedData.districts.length} Districts.`);
  }

  // 5. Seed Categories
  console.log('Seeding categories...');
  const categoryIdMap = new Map<string, string>();
  if (seedData.categories) {
    for (const cat of seedData.categories) {
      // For infrastructure, set specific ID 'cat-infra-001' to align with test fixtures
      const specificId = cat.code === 'infrastructure' ? 'cat-infra-001' : undefined;
      const created = await prisma.category.upsert({
        where: { code: cat.code },
        update: {
          titleEn: cat.titleEn,
          titleBn: cat.titleBn,
          subtitleEn: cat.subtitleEn,
          subtitleBn: cat.subtitleBn,
          icon: cat.icon,
          sortOrder: cat.sortOrder,
        },
        create: {
          id: specificId,
          code: cat.code,
          titleEn: cat.titleEn,
          titleBn: cat.titleBn,
          subtitleEn: cat.subtitleEn,
          subtitleBn: cat.subtitleBn,
          icon: cat.icon,
          sortOrder: cat.sortOrder,
        },
      });
      categoryIdMap.set(cat.code, created.id);
    }
    console.log(`Seeded ${seedData.categories.length} Categories.`);
  }

  // 6. Seed Evidence Items (Sample)
  console.log('Seeding evidence items...');
  const sampleEvidence = await prisma.evidenceItem.upsert({
    where: { id: 'ev-1' },
    update: {
      title: 'West Bengal State Gazette Notification No. WB/4092/2026',
      sourceUrl: 'https://wb.gov.in/gazette/2026/notice-4092.pdf',
      sourceType: 'GAZETTE' as SourceType,
      sourceTier: 'TIER_1' as SourceTier,
      extractedText: 'Land acquisition finalized and capital expenditure approved under Schedule 4.',
      language: 'en',
    },
    create: {
      id: 'ev-1',
      title: 'West Bengal State Gazette Notification No. WB/4092/2026',
      sourceUrl: 'https://wb.gov.in/gazette/2026/notice-4092.pdf',
      sourceType: 'GAZETTE' as SourceType,
      sourceTier: 'TIER_1' as SourceTier,
      extractedText: 'Land acquisition finalized and capital expenditure approved under Schedule 4.',
      language: 'en',
    },
  });

  // 7. Seed Promises
  console.log('Seeding promises...');
  const keyPromises = seedData.keyPromises || [];
  const districtList = Array.from(districtMap.values());

  if (seedData.promises) {
    let pCount = 0;
    for (let i = 0; i < seedData.promises.length; i++) {
      const prom = seedData.promises[i];
      const categoryId = categoryIdMap.get(prom.category);
      if (!categoryId) {
        continue;
      }

      const pCode = prom.code || `${prom.category}-${prom.number}`;
      const isKey = prom.isKeyPromise ?? !!keyPromises.find((kp: any) => kp.linkedCategory === prom.category && kp.linkedPromiseNum === prom.number);

      const statusVal = prom.status ? (prom.status.toUpperCase() as PromiseStatus) : 'NOT_STARTED';

      const promise = await prisma.promise.upsert({
        where: { code: pCode },
        update: {
          categoryId,
          titleEn: prom.titleEn,
          titleBn: prom.titleBn,
          descriptionEn: prom.descriptionEn,
          descriptionBn: prom.descriptionBn,
          status: statusVal,
          confidence: (prom.confidence || 'C') as Confidence,
          isKeyPromise: isKey,
          keyPromiseNumber: prom.keyPromiseNumber ?? (isKey ? (prom.number || 1) : null),
          deadlineDate: prom.deadlineDate ? new Date(prom.deadlineDate) : null,
        },
        create: {
          id: pCode === 'INFRA-01' ? 'prom-1' : undefined,
          code: pCode,
          categoryId,
          titleEn: prom.titleEn,
          titleBn: prom.titleBn,
          descriptionEn: prom.descriptionEn,
          descriptionBn: prom.descriptionBn,
          status: statusVal,
          confidence: (prom.confidence || 'C') as Confidence,
          isKeyPromise: isKey,
          keyPromiseNumber: prom.keyPromiseNumber ?? (isKey ? (prom.number || 1) : null),
          deadlineDate: prom.deadlineDate ? new Date(prom.deadlineDate) : null,
        },
      });

      // Link to districts
      if (districtList.length > 0) {
        const assignedDistrict = districtList[i % districtList.length];
        await prisma.promiseDistrict.upsert({
          where: {
            promiseId_districtId: {
              promiseId: promise.id,
              districtId: assignedDistrict.id,
            },
          },
          update: {},
          create: {
            promiseId: promise.id,
            districtId: assignedDistrict.id,
          },
        });

        // If INFRA-01, also link to Kolkata and Darjeeling
        if (pCode === 'INFRA-01') {
          const kol = districtMap.get('KOL');
          const dar = districtMap.get('DAR');
          if (kol) {
            await prisma.promiseDistrict.upsert({
              where: { promiseId_districtId: { promiseId: promise.id, districtId: kol.id } },
              update: {},
              create: { promiseId: promise.id, districtId: kol.id },
            });
          }
          if (dar) {
            await prisma.promiseDistrict.upsert({
              where: { promiseId_districtId: { promiseId: promise.id, districtId: dar.id } },
              update: {},
              create: { promiseId: promise.id, districtId: dar.id },
            });
          }

          // Also add status history for INFRA-01
          const existingHistory = await prisma.statusHistory.count({ where: { promiseId: promise.id } });
          if (existingHistory === 0 && adminUser) {
            await prisma.statusHistory.create({
              data: {
                promiseId: promise.id,
                oldStatus: null,
                newStatus: 'ANNOUNCED',
                reason: 'Official manifesto commitment',
                changedById: adminUser.id,
                createdAt: new Date('2026-01-01T00:00:00Z'),
              },
            });
            await prisma.statusHistory.create({
              data: {
                promiseId: promise.id,
                oldStatus: 'ANNOUNCED',
                newStatus: 'UNDER_IMPLEMENTATION',
                reason: 'Work commenced',
                changedById: adminUser.id,
                evidenceItemId: sampleEvidence.id,
                createdAt: new Date('2026-03-01T00:00:00Z'),
              },
            });
          }
        }
      }

      pCount++;
    }
    console.log(`Seeded ${pCount} Promises.`);
  }

  // 8. Seed Indicators
  console.log('Seeding indicators...');
  if (seedData.indicators) {
    for (const ind of seedData.indicators) {
      const specificId = ind.code === 'GSDP_GROWTH' ? 'ind-1' : (ind.code === 'TRILLION_USD_PROGRESS' ? 'ind-2' : undefined);
      const indicator = await prisma.indicator.upsert({
        where: { code: ind.code },
        update: {
          nameEn: ind.nameEn,
          nameBn: ind.nameBn,
          unit: ind.unit,
          pillar: ind.pillar,
        },
        create: {
          id: specificId,
          code: ind.code,
          nameEn: ind.nameEn,
          nameBn: ind.nameBn,
          unit: ind.unit,
          pillar: ind.pillar,
        },
      });

      if (ind.values && ind.values.length > 0) {
        // Clear old values for clean seed
        await prisma.indicatorValue.deleteMany({ where: { indicatorId: indicator.id } });
        for (const val of ind.values) {
          await prisma.indicatorValue.create({
            data: {
              indicatorId: indicator.id,
              value: val.value,
              date: new Date(val.date || '2026-01-01T00:00:00Z'),
              source: val.scenario || 'Official Economic Survey',
              confidence: 'A' as Confidence,
              districtId: districtMap.get('KOL')?.id,
            },
          });
        }
      }
    }
    console.log(`Seeded ${seedData.indicators.length} Indicators.`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });