import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RentalsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findDumpsterById(id: number) {
    return this.prisma.dumpster.findUnique({
      where: { id },
      select: { id: true },
    });
  }

  findOpenRentalByDumpsterId(dumpsterId: number) {
    return this.prisma.rental.findFirst({
      where: { dumpsterId, endDate: null },
      select: { id: true },
    });
  }

  create(data: {
    dumpsterId: number;
    cep: string;
    street: string;
    district: string;
    city: string;
  }) {
    return this.prisma.rental.create({
      data,
      select: {
        id: true,
        dumpsterId: true,
        cep: true,
        street: true,
        district: true,
        city: true,
        startDate: true,
        endDate: true,
        createdAt: true,
      },
    });
  }

  listByDumpsterId(dumpsterId: number) {
    return this.prisma.rental.findMany({
      where: { dumpsterId },
      orderBy: { startDate: 'desc' },
      select: {
        id: true,
        dumpsterId: true,
        cep: true,
        street: true,
        district: true,
        city: true,
        startDate: true,
        endDate: true,
        createdAt: true,
      },
    });
  }

  findById(id: number) {
    return this.prisma.rental.findUnique({
      where: { id },
      select: { id: true, dumpsterId: true, endDate: true },
    });
  }

  finish(id: number) {
    return this.prisma.rental.update({
      where: { id },
      data: { endDate: new Date() },
      select: {
        id: true,
        dumpsterId: true,
        cep: true,
        street: true,
        district: true,
        city: true,
        startDate: true,
        endDate: true,
        createdAt: true,
      },
    });
  }
}
