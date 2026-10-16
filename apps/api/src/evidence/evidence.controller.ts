import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { EvidenceService } from './evidence.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.evidenceService.findAll(query);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'RESEARCHER')
  async create(@Body() body: any, @Request() req: any) {
    return this.evidenceService.create(body, req.user);
  }

  @Patch(':id/review')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async review(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.evidenceService.review(id, body, req.user);
  }
}