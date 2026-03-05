import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDumpsterDto } from './dto/create-dumpster.dto';
import { ListDumpstersQueryDto } from './dto/list-dumpsters.query';
import { UpdateDumpsterDto } from './dto/update-dumpster.dto';
import { DumpstersRepository } from './dumpsters.repository';
import { PrismaStatusError } from '../prisma/prisma.constantes';

type DumpsterResponse = {
  id: number;
  serial: string;
  color: string;
  isRented: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class DumpstersService {
  constructor(private readonly repo: DumpstersRepository) {}

  private mapDumpster(d: any): DumpsterResponse {
    const openRentalsCount = d._count?.rentals ?? 0;
    return {
      id: d.id,
      serial: d.serial,
      color: d.color,
      isRented: openRentalsCount > 0,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  }

  async create(dto: CreateDumpsterDto): Promise<DumpsterResponse> {
    try {
      const created = await this.repo.create({
        serial: dto.serial.trim(),
        color: dto.color.trim(),
      });

      return this.mapDumpster(created);
    } catch (e: any) {
      if (e?.code === PrismaStatusError.CONFLICT) {
        throw new ConflictException(
          'Já existe uma caçamba com esse número de série.',
        );
      }
      throw e;
    }
  }

  async findAll(query: ListDumpstersQueryDto): Promise<DumpsterResponse[]> {
    const rows = await this.repo.findMany({
      serial: query.serial,
      status: query.status as any,
    });

    return rows.map((d: any) => this.mapDumpster(d));
  }

  async findOne(id: number): Promise<DumpsterResponse> {
    const d = await this.repo.findById(id);

    if (!d) throw new NotFoundException('Caçamba não encontrada.');
    return this.mapDumpster(d);
  }

  async update(id: number, dto: UpdateDumpsterDto): Promise<DumpsterResponse> {
    await this.findOne(id);

    try {
      const updated = await this.repo.update(id, {
        serial: dto.serial?.trim(),
        color: dto.color?.trim(),
      });

      return this.mapDumpster(updated);
    } catch (e: any) {
      if (e?.code === PrismaStatusError.CONFLICT) {
        throw new ConflictException(
          'Já existe uma caçamba com esse número de série.',
        );
      }
      throw e;
    }
  }
}
