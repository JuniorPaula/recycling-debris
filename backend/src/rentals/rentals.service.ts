import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRentalDto } from './dto/create-rental.dto';
import { RentalsRepository } from './rentals.repository';

type RentalResponse = {
  id: number;
  dumpsterId: number;
  cep: string;
  street: string;
  district: string;
  city: string;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
};

@Injectable()
export class RentalsService {
  constructor(private readonly repo: RentalsRepository) {}

  private normalizeCep(cep: string) {
    return cep.replace(/\D/g, '');
  }

  async create(dto: CreateRentalDto): Promise<RentalResponse> {
    const dumpster = await this.repo.findDumpsterById(dto.dumpsterId);

    if (!dumpster) throw new NotFoundException('Caçamba não encontrada.');

    const openRental = await this.repo.findOpenRentalByDumpsterId(
      dto.dumpsterId,
    );

    if (openRental) {
      throw new BadRequestException('Esta caçamba já está alugada.');
    }

    const created = await this.repo.create({
      dumpsterId: dto.dumpsterId,
      cep: this.normalizeCep(dto.cep),
      street: dto.street.trim(),
      district: dto.district.trim(),
      city: dto.city.trim(),
    });

    return created;
  }

  async listByDumpster(dumpsterId: number): Promise<RentalResponse[]> {
    const exists = await this.repo.findDumpsterById(dumpsterId);

    if (!exists) throw new NotFoundException('Caçamba não encontrada.');

    return this.repo.listByDumpsterId(dumpsterId);
  }

  async finish(rentalId: number): Promise<RentalResponse> {
    const rental = await this.repo.findById(rentalId);

    if (!rental) throw new NotFoundException('Aluguel não encontrado.');

    if (rental.endDate) {
      throw new BadRequestException('Este aluguel já foi finalizado.');
    }

    return this.repo.finish(rentalId);
  }
}
