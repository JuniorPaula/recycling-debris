import { Module } from '@nestjs/common';
import { RentalsController } from './rentals.controller';
import { RentalsService } from './rentals.service';
import { RentalsRepository } from './rentals.repository';

@Module({
  controllers: [RentalsController],
  providers: [RentalsService, RentalsRepository],
})
export class RentalsModule {}
