import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { DumpstersModule } from './dumpsters/dumpsters.module';
import { RentalsModule } from './rentals/rentals.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    PrismaModule,
    DumpstersModule,
    RentalsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
