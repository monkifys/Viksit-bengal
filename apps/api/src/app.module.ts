import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DistrictsModule } from './districts/districts.module';
import { PromisesModule } from './promises/promises.module';
import { EvidenceModule } from './evidence/evidence.module';
import { IndicatorsModule } from './indicators/indicators.module';
import { ScraperModule } from './scraper/scraper.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    DistrictsModule,
    PromisesModule,
    EvidenceModule,
    IndicatorsModule,
    ScraperModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}