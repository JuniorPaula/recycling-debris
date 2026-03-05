import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

enum RentalStatus {
  AVAILABLE = 'available',
  RENTED = 'rented',
}

@Injectable()
export class DumpstersRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { serial: string; color: string }) {
    return this.prisma.dumpster.create({
      data,
      select: {
        id: true,
        serial: true,
        color: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { rentals: { where: { endDate: null } } },
        },
      },
    });
  }

  findMany(params: {
    serial?: string;
    status?: RentalStatus.AVAILABLE | RentalStatus.RENTED;
  }) {
    const where: any = {};

    if (params.serial) {
      where.serial = { contains: params.serial, mode: 'insensitive' };
    }

    if (params.status === RentalStatus.RENTED) {
      where.rentals = { some: { endDate: null } };
    } else if (params.status === RentalStatus.AVAILABLE) {
      where.rentals = { none: { endDate: null } };
    }

    return this.prisma.dumpster.findMany({
      where,
      orderBy: { id: 'desc' },
      select: {
        id: true,
        serial: true,
        color: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { rentals: { where: { endDate: null } } } },
      },
    });
  }

  findById(id: number) {
    return this.prisma.dumpster.findUnique({
      where: { id },
      select: {
        id: true,
        serial: true,
        color: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { rentals: { where: { endDate: null } } } },
      },
    });
  }

  update(id: number, data: { serial?: string; color?: string }) {
    return this.prisma.dumpster.update({
      where: { id },
      data,
      select: {
        id: true,
        serial: true,
        color: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { rentals: { where: { endDate: null } } } },
      },
    });
  }
}
