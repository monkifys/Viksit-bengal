import { Controller, Get, Param } from '@nestjs/common';
import { DistrictsService } from './districts.service';

@Controller('districts')
export class DistrictsController {
  constructor(private readonly districtsService: DistrictsService) {}

  @Get()
  async findAll() {
    return this.districtsService.findAll();
  }

  @Get(':code')
  async findByCode(@Param('code') code: string) {
    return this.districtsService.findByCode(code);
  }
}