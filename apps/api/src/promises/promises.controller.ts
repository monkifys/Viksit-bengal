import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { PromisesService } from './promises.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('promises')
export class PromisesController {
  constructor(private readonly promisesService: PromisesService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.promisesService.findAll(query);
  }

  @Get(':code')
  async findByCode(@Param('code') code: string) {
    return this.promisesService.findByCode(code);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'RESEARCHER')
  async create(@Body() body: any, @Request() req: any) {
    return this.promisesService.create(body, req.user);
  }

  @Patch(':code/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateStatus(@Param('code') code: string, @Body() body: any, @Request() req: any) {
    return this.promisesService.updateStatus(code, body, req.user);
  }
}