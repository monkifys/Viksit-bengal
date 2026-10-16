import { Controller, Get, Post } from '@nestjs/common';
import { ScraperService } from './scraper.service';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get('status')
  getStatus() {
    return this.scraperService.getStatus();
  }

  @Post('trigger')
  async trigger() {
    return this.scraperService.triggerScraper();
  }
}
