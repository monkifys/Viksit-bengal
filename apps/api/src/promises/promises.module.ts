import { Module } from '@nestjs/common';
import { PromisesController } from './promises.controller';
import { PromisesService } from './promises.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PromisesController],
  providers: [PromisesService],
  exports: [PromisesService],
})
export class PromisesModule {}