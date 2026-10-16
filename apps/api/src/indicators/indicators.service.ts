import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IndicatorsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const indicators = await this.prisma.indicator.findMany({
      include: {
        values: {
          orderBy: { date: 'asc' },
        },
      },
      orderBy: { code: 'asc' },
    });

    return indicators.map((ind) => {
      const values = ind.values.map((v) => {
        const yr = new Date(v.date).getFullYear();
        return {
          id: v.id,
          year: yr,
          date: v.date,
          value: v.value,
          scenario: v.source && ['CONSERVATIVE', 'BASE_CASE', 'AMBITIOUS'].includes(v.source) ? v.source : undefined,
          source: v.source,
        };
      });

      const currentValue = values.length > 0 ? values[values.length - 1].value : 0;
      const targetValue = ind.code === 'GSDP_GROWTH' ? 12.5 : (ind.code === 'TRILLION_USD_PROGRESS' ? 1000 : 100);

      return {
        id: ind.id,
        code: ind.code,
        nameEn: ind.nameEn,
        nameBn: ind.nameBn,
        unit: ind.unit,
        pillar: ind.pillar,
        currentValue,
        targetValue,
        values,
      };
    });
  }

  async findByCode(code: string) {
    if (!code) {
      throw new NotFoundException('Indicator code required');
    }

    const ind = await this.prisma.indicator.findFirst({
      where: {
        code: {
          equals: code,
          mode: 'insensitive',
        },
      },
      include: {
        values: {
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!ind) {
      throw new NotFoundException(`Indicator with code ${code} not found`);
    }

    const values = ind.values.map((v) => {
      const yr = new Date(v.date).getFullYear();
      return {
        id: v.id,
        year: yr,
        date: v.date,
        value: v.value,
        scenario: v.source && ['CONSERVATIVE', 'BASE_CASE', 'AMBITIOUS'].includes(v.source) ? v.source : undefined,
        source: v.source,
      };
    });

    const currentValue = values.length > 0 ? values[values.length - 1].value : 0;
    const targetValue = ind.code === 'GSDP_GROWTH' ? 12.5 : (ind.code === 'TRILLION_USD_PROGRESS' ? 1000 : 100);

    return {
      id: ind.id,
      code: ind.code,
      nameEn: ind.nameEn,
      nameBn: ind.nameBn,
      unit: ind.unit,
      pillar: ind.pillar,
      currentValue,
      targetValue,
      values,
    };
  }

  async createValue(code: string, dto: { year?: number; value: number; targetValue?: number; date?: string }, user: any) {
    if (dto.value === undefined || dto.value === null || typeof dto.value !== 'number') {
      throw new BadRequestException('Validation failed: value must be a number');
    }

    if (dto.year !== undefined && typeof dto.year !== 'number') {
      throw new BadRequestException('Validation failed: year must be a number');
    }

    const ind = await this.prisma.indicator.findFirst({
      where: {
        code: {
          equals: code,
          mode: 'insensitive',
        },
      },
    });

    if (!ind) {
      throw new NotFoundException(`Indicator with code ${code} not found`);
    }

    const dateVal = dto.date
      ? new Date(dto.date)
      : dto.year
      ? new Date(`${dto.year}-01-01T00:00:00Z`)
      : new Date();

    const created = await this.prisma.indicatorValue.create({
      data: {
        indicatorId: ind.id,
        value: dto.value,
        date: dateVal,
        source: user?.email || 'API entry',
      },
    });

    return {
      id: created.id,
      indicatorId: ind.id,
      year: dto.year || dateVal.getFullYear(),
      value: created.value,
      targetValue: dto.targetValue,
      date: created.date,
    };
  }
}