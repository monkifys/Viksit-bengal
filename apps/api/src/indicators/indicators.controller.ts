import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { IndicatorsService } from './indicators.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('indicators')
export class IndicatorsController {
  constructor(private readonly indicatorsService: IndicatorsService) {}

  @Get()
  async findAll() {
    return this.indicatorsService.findAll();
  }

  @Get(':code')
  async findByCode(@Param('code') code: string) {
    return this.indicatorsService.findByCode(code);
  }

  @Post(':code/values')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'RESEARCHER')
  async createValue(@Param('code') code: string, @Body() body: any, @Request() req: any) {
    return this.indicatorsService.createValue(code, body, req.user);
  }
}