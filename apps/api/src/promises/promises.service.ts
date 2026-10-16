import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PromiseStatus, Confidence } from '@viksit/database';

@Injectable()
export class PromisesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { categoryId?: string; status?: string; districtCode?: string; search?: string }) {
    const where: any = {};

    if (query.status) {
      where.status = query.status.toUpperCase();
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.districtCode) {
      where.districts = {
        some: {
          district: {
            code: {
              equals: query.districtCode,
              mode: 'insensitive',
            },
          },
        },
      };
    }

    if (query.search) {
      where.OR = [
        { titleEn: { contains: query.search, mode: 'insensitive' } },
        { titleBn: { contains: query.search } },
        { descriptionEn: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const promises = await this.prisma.promise.findMany({
      where,
      include: {
        category: true,
        districts: {
          include: {
            district: true,
          },
        },
        history: {
          orderBy: { createdAt: 'asc' },
        },
        updates: {
          include: {
            update: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return promises.map((p) => ({
      ...p,
      statusHistory: p.history.map((h) => ({
        id: h.id,
        status: h.newStatus,
        newStatus: h.newStatus,
        oldStatus: h.oldStatus,
        comment: h.reason,
        reason: h.reason,
        timestamp: h.createdAt.toISOString(),
        createdAt: h.createdAt,
      })),
      evidenceItems: [],
    }));
  }

  async findByCode(code: string) {
    if (!code) {
      throw new NotFoundException('Promise code required');
    }

    const promise = await this.prisma.promise.findFirst({
      where: {
        code: {
          equals: code,
          mode: 'insensitive',
        },
      },
      include: {
        category: true,
        districts: {
          include: {
            district: true,
          },
        },
        history: {
          include: {
            evidenceItem: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        updates: {
          include: {
            update: true,
          },
        },
      },
    });

    if (!promise) {
      throw new NotFoundException(`Promise with code ${code} not found`);
    }

    const evidenceItems = await this.prisma.evidenceItem.findMany({
      where: {
        statusHistories: {
          some: {
            promiseId: promise.id,
          },
        },
      },
    });

    return {
      ...promise,
      statusHistory: promise.history.map((h) => ({
        id: h.id,
        status: h.newStatus,
        newStatus: h.newStatus,
        oldStatus: h.oldStatus,
        comment: h.reason,
        reason: h.reason,
        timestamp: h.createdAt.toISOString(),
        createdAt: h.createdAt,
      })),
      evidenceItems,
    };
  }

  async create(dto: any, user: any) {
    if (!dto.code || !dto.titleEn || !dto.titleBn) {
      throw new BadRequestException('Validation failed: code, titleEn, titleBn required');
    }

    let categoryId = dto.categoryId;
    if (categoryId) {
      const cat = await this.prisma.category.findFirst({
        where: {
          OR: [
            { id: categoryId },
            { code: categoryId },
            { code: categoryId.replace(/^cat-/, '') },
          ],
        },
      });
      if (cat) {
        categoryId = cat.id;
      } else {
        try {
          const createdCat = await this.prisma.category.create({
            data: {
              id: categoryId,
              code: categoryId,
              titleEn: 'Agriculture & Rural',
              titleBn: 'কৃষি ও গ্রামীণ',
            },
          });
          categoryId = createdCat.id;
        } catch {
          const firstCat = await this.prisma.category.findFirst();
          categoryId = firstCat ? firstCat.id : categoryId;
        }
      }
    } else {
      const firstCat = await this.prisma.category.findFirst();
      categoryId = firstCat ? firstCat.id : 'default-cat';
    }

    const VALID_PROMISE_STATUSES = [
      'NOT_STARTED',
      'ANNOUNCED',
      'LEGALLY_INITIATED',
      'FUNDED',
      'UNDER_IMPLEMENTATION',
      'PARTIALLY_DELIVERED',
      'DELIVERED',
      'DELAYED',
      'REVERSED',
      'DISPUTED',
      'NOT_VERIFIABLE',
    ];

    if (dto.status && !VALID_PROMISE_STATUSES.includes(dto.status.toUpperCase())) {
      throw new BadRequestException(`Invalid status enum: ${dto.status}`);
    }

    const statusVal = dto.status ? (dto.status.toUpperCase() as PromiseStatus) : 'NOT_STARTED';

    const promise = await this.prisma.promise.upsert({
      where: { code: dto.code },
      update: {
        categoryId,
        titleEn: dto.titleEn,
        titleBn: dto.titleBn,
        descriptionEn: dto.descriptionEn,
        descriptionBn: dto.descriptionBn,
        status: statusVal,
        confidence: (dto.confidence || 'C') as Confidence,
        isKeyPromise: !!dto.isKeyPromise,
        keyPromiseNumber: dto.keyPromiseNumber,
      },
      create: {
        code: dto.code,
        categoryId,
        titleEn: dto.titleEn,
        titleBn: dto.titleBn,
        descriptionEn: dto.descriptionEn,
        descriptionBn: dto.descriptionBn,
        status: statusVal,
        confidence: (dto.confidence || 'C') as Confidence,
        isKeyPromise: !!dto.isKeyPromise,
        keyPromiseNumber: dto.keyPromiseNumber,
      },
    });

    await this.prisma.statusHistory.create({
      data: {
        promiseId: promise.id,
        oldStatus: null,
        newStatus: statusVal,
        reason: dto.comment || 'Initial promise registration',
        changedById: user.id || user.email || 'system',
      },
    });

    return this.findByCode(promise.code);
  }

  async updateStatus(code: string, dto: { status: PromiseStatus; comment?: string }, user: any) {
    const VALID_PROMISE_STATUSES = [
      'NOT_STARTED',
      'ANNOUNCED',
      'LEGALLY_INITIATED',
      'FUNDED',
      'UNDER_IMPLEMENTATION',
      'PARTIALLY_DELIVERED',
      'DELIVERED',
      'DELAYED',
      'REVERSED',
      'DISPUTED',
      'NOT_VERIFIABLE',
    ];

    if (!dto.status || !VALID_PROMISE_STATUSES.includes(dto.status.toUpperCase())) {
      throw new BadRequestException(`Invalid status enum: ${dto.status}`);
    }

    const promise = await this.prisma.promise.findFirst({
      where: {
        code: {
          equals: code,
          mode: 'insensitive',
        },
      },
    });

    if (!promise) {
      throw new NotFoundException(`Promise with code ${code} not found`);
    }

    const oldStatus = promise.status;
    const newStatus = dto.status.toUpperCase() as PromiseStatus;

    await this.prisma.promise.update({
      where: { id: promise.id },
      data: {
        status: newStatus,
      },
    });

    await this.prisma.statusHistory.create({
      data: {
        promiseId: promise.id,
        oldStatus,
        newStatus,
        reason: dto.comment,
        changedById: user.id || user.email || 'admin',
      },
    });

    return this.findByCode(promise.code);
  }
}