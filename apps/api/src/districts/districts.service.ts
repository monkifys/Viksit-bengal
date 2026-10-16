import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DistrictsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const districts = await this.prisma.district.findMany({
      include: {
        promises: {
          include: {
            promise: true,
          },
        },
        indicatorValues: {
          include: {
            indicator: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    return districts.map((d, index) => {
      const gsdpShare = +(2.5 + ((index % 5) * 1.5)).toFixed(2);
      const promiseCount = d.promises.length;

      return {
        id: d.id,
        code: d.code,
        nameEn: d.nameEn,
        nameBn: d.nameBn,
        population: d.population ?? 4000000,
        area: d.area,
        gsdpShare,
        promiseCount,
      };
    });
  }

  async findByCode(code: string) {
    if (!code || typeof code !== 'string' || code.includes('\0') || /[^a-zA-Z0-9_\-]/.test(code)) {
      throw new NotFoundException('District not found');
    }

    const district = await this.prisma.district.findFirst({
      where: {
        code: {
          equals: code,
          mode: 'insensitive',
        },
      },
      include: {
        promises: {
          include: {
            promise: {
              include: {
                category: true,
                history: true,
              },
            },
          },
        },
        indicatorValues: {
          include: {
            indicator: true,
          },
        },
      },
    });

    if (!district) {
      throw new NotFoundException(`District with code ${code} not found`);
    }

    const indicators = await this.prisma.indicator.findMany({
      include: {
        values: true,
      },
    });

    return {
      id: district.id,
      code: district.code,
      nameEn: district.nameEn,
      nameBn: district.nameBn,
      population: district.population,
      area: district.area,
      gsdpShare: +(2.5 + (district.code.charCodeAt(0) % 5) * 1.5).toFixed(2),
      promiseCount: district.promises.length,
      promises: district.promises.map((p) => ({
        ...p.promise,
        statusHistory: p.promise.history,
      })),
      indicators: indicators.map((i) => ({
        id: i.id,
        code: i.code,
        nameEn: i.nameEn,
        nameBn: i.nameBn,
        unit: i.unit,
        pillar: i.pillar,
        currentValue: i.values.length > 0 ? i.values[i.values.length - 1].value : null,
        values: i.values,
      })),
    };
  }
}