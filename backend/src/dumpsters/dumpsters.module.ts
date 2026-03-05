import { Module } from '@nestjs/common';
import { DumpstersController } from './dumpsters.controller';
import { DumpstersService } from './dumpsters.service';
import { DumpstersRepository } from './dumpsters.repository';

@Module({
  controllers: [DumpstersController],
  providers: [DumpstersService, DumpstersRepository],
})
export class DumpstersModule {}
