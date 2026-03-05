import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { RentalsRepository } from './rentals.repository';

function makeRentalRow(overrides: Partial<any> = {}) {
  return {
    id: 1,
    dumpsterId: 1,
    cep: '88340000',
    street: 'Rua A',
    district: 'Centro',
    city: 'Penha',
    startDate: new Date('2026-03-01T10:00:00.000Z'),
    endDate: null,
    createdAt: new Date('2026-03-01T10:00:00.000Z'),
    ...overrides,
  };
}

describe('RentalsService', () => {
  let service: RentalsService;
  let repo: jest.Mocked<RentalsRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RentalsService,
        {
          provide: RentalsRepository,
          useValue: {
            findDumpsterById: jest.fn(),
            findOpenRentalByDumpsterId: jest.fn(),
            create: jest.fn(),
            listByDumpsterId: jest.fn(),
            findById: jest.fn(),
            finish: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(RentalsService);
    repo = module.get(RentalsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw NotFoundException when dumpster does not exist', async () => {
      repo.findDumpsterById.mockResolvedValue(null as any);

      await expect(
        service.create({
          dumpsterId: 999,
          cep: '88340-000',
          street: 'Rua A',
          district: 'Centro',
          city: 'Penha',
        } as any),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(repo.findDumpsterById).toHaveBeenCalledWith(999);
      expect(repo.findOpenRentalByDumpsterId).not.toHaveBeenCalled();
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when dumpster already has an open rental', async () => {
      repo.findDumpsterById.mockResolvedValue({ id: 1 } as any);
      repo.findOpenRentalByDumpsterId.mockResolvedValue({ id: 77 } as any);

      await expect(
        service.create({
          dumpsterId: 1,
          cep: '88340-000',
          street: 'Rua A',
          district: 'Centro',
          city: 'Penha',
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(repo.findOpenRentalByDumpsterId).toHaveBeenCalledWith(1);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should normalize CEP and trim fields before creating rental', async () => {
      repo.findDumpsterById.mockResolvedValue({ id: 1 } as any);
      repo.findOpenRentalByDumpsterId.mockResolvedValue(null as any);

      repo.create.mockResolvedValue(
        makeRentalRow({
          id: 10,
          dumpsterId: 1,
          cep: '88340000',
          street: 'Rua das Flores',
          district: 'Centro',
          city: 'Penha',
        }) as any,
      );

      const res = await service.create({
        dumpsterId: 1,
        cep: ' 88340-000 ',
        street: '  Rua das Flores  ',
        district: '  Centro  ',
        city: '  Penha  ',
      } as any);

      expect(repo.create).toHaveBeenCalledWith({
        dumpsterId: 1,
        cep: '88340000',
        street: 'Rua das Flores',
        district: 'Centro',
        city: 'Penha',
      });

      expect(res).toMatchObject({
        id: 10,
        dumpsterId: 1,
        cep: '88340000',
        street: 'Rua das Flores',
        district: 'Centro',
        city: 'Penha',
      });
    });
  });

  describe('listByDumpster', () => {
    it('should throw NotFoundException when dumpster does not exist', async () => {
      repo.findDumpsterById.mockResolvedValue(null as any);

      await expect(service.listByDumpster(123)).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(repo.findDumpsterById).toHaveBeenCalledWith(123);
      expect(repo.listByDumpsterId).not.toHaveBeenCalled();
    });

    it('should return rentals list when dumpster exists', async () => {
      repo.findDumpsterById.mockResolvedValue({ id: 123 } as any);

      repo.listByDumpsterId.mockResolvedValue([
        makeRentalRow({ id: 1, dumpsterId: 123 }),
        makeRentalRow({
          id: 2,
          dumpsterId: 123,
          endDate: new Date('2026-03-03T10:00:00.000Z'),
        }),
      ] as any);

      const res = await service.listByDumpster(123);

      expect(repo.findDumpsterById).toHaveBeenCalledWith(123);
      expect(repo.listByDumpsterId).toHaveBeenCalledWith(123);

      expect(res).toHaveLength(2);
      expect(res[0]).toMatchObject({ id: 1, dumpsterId: 123 });
      expect(res[1].endDate).toBeInstanceOf(Date);
    });
  });

  describe('finish', () => {
    it('should throw NotFoundException when rental does not exist', async () => {
      repo.findById.mockResolvedValue(null as any);

      await expect(service.finish(999)).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(repo.findById).toHaveBeenCalledWith(999);
      expect(repo.finish).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when rental is already finished', async () => {
      repo.findById.mockResolvedValue(
        makeRentalRow({
          id: 5,
          endDate: new Date('2026-03-02T10:00:00.000Z'),
        }) as any,
      );

      await expect(service.finish(5)).rejects.toBeInstanceOf(
        BadRequestException,
      );

      expect(repo.finish).not.toHaveBeenCalled();
    });

    it('should finish rental when endDate is null', async () => {
      repo.findById.mockResolvedValue(
        makeRentalRow({ id: 7, endDate: null }) as any,
      );

      repo.finish.mockResolvedValue(
        makeRentalRow({
          id: 7,
          endDate: new Date('2026-03-05T10:00:00.000Z'),
        }) as any,
      );

      const res = await service.finish(7);

      expect(repo.finish).toHaveBeenCalledWith(7);
      expect(res.id).toBe(7);
      expect(res.endDate).toBeInstanceOf(Date);
    });
  });
});
