import { Test } from '@nestjs/testing';
import { DumpstersService } from './dumpsters.service';
import { DumpstersRepository } from './dumpsters.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';

function makeDumpsterRow(overrides: Partial<any> = {}) {
  return {
    id: 1,
    serial: 'CA-0001',
    color: 'Verde',
    createdAt: new Date('2026-03-01T10:00:00.000Z'),
    updatedAt: new Date('2026-03-01T10:00:00.000Z'),
    _count: { rentals: 0 },
    ...overrides,
  };
}

describe('DumpstersService', () => {
  let service: DumpstersService;
  let repo: jest.Mocked<DumpstersRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DumpstersService,
        {
          provide: DumpstersRepository,
          useValue: {
            create: jest.fn(),
            findMany: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(DumpstersService);
    repo = module.get(DumpstersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should create a dumpster', async () => {
      repo.create.mockResolvedValue({
        id: 1,
        serial: 'CA-1',
        color: 'Verde',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { rentals: 0 },
      } as any);

      const res = await service.create({
        serial: 'CA-1',
        color: 'Verde',
      } as any);

      expect(res.isRented).toBe(false);

      expect(repo.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return mapped list with isRented=false when no open rentals', async () => {
      repo.findMany.mockResolvedValue([
        makeDumpsterRow({ id: 1, _count: { rentals: 0 } }),
        makeDumpsterRow({ id: 2, serial: 'CA-0002', _count: { rentals: 0 } }),
      ] as any);

      const res = await service.findAll({} as any);

      expect(repo.findMany).toHaveBeenCalledWith({
        serial: undefined,
        status: undefined,
      });
      expect(res).toHaveLength(2);
      expect(res[0]).toMatchObject({
        id: 1,
        serial: 'CA-0001',
        isRented: false,
      });
      expect(res[1]).toMatchObject({
        id: 2,
        serial: 'CA-0002',
        isRented: false,
      });
    });

    it('should return mapped list with isRented=true when open rentals count > 0', async () => {
      repo.findMany.mockResolvedValue([
        makeDumpsterRow({ id: 10, serial: 'CA-0010', _count: { rentals: 1 } }),
      ] as any);

      const res = await service.findAll({ status: 'rented' } as any);

      expect(repo.findMany).toHaveBeenCalledWith({
        serial: undefined,
        status: 'rented',
      });
      expect(res).toHaveLength(1);
      expect(res[0].isRented).toBe(true);
    });

    it('should forward serial filter to repository', async () => {
      repo.findMany.mockResolvedValue([] as any);

      await service.findAll({ serial: 'CA-00' } as any);

      expect(repo.findMany).toHaveBeenCalledWith({
        serial: 'CA-00',
        status: undefined,
      });
    });
  });

  describe('findOne', () => {
    it('should return mapped object when found', async () => {
      repo.findById.mockResolvedValue(
        makeDumpsterRow({ id: 5, _count: { rentals: 2 } }) as any,
      );

      const res = await service.findOne(5);

      expect(repo.findById).toHaveBeenCalledWith(5);
      expect(res).toMatchObject({
        id: 5,
        serial: 'CA-0001',
        color: 'Verde',
        isRented: true,
      });
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null as any);

      await expect(service.findOne(999)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repo.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when target does not exist', async () => {
      repo.findById.mockResolvedValue(null as any);

      await expect(
        service.update(123, { color: 'Azul' } as any),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(repo.findById).toHaveBeenCalledWith(123);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should trim fields and update successfully', async () => {
      repo.findById.mockResolvedValue(makeDumpsterRow({ id: 1 }) as any);

      repo.update.mockResolvedValue(
        makeDumpsterRow({
          id: 1,
          serial: 'CA-0009',
          color: 'Azul',
          updatedAt: new Date('2026-03-02T10:00:00.000Z'),
          _count: { rentals: 0 },
        }) as any,
      );

      const res = await service.update(1, {
        serial: '  CA-0009  ',
        color: '  Azul  ',
      } as any);

      expect(repo.update).toHaveBeenCalledWith(1, {
        serial: 'CA-0009',
        color: 'Azul',
      });

      expect(res).toMatchObject({
        id: 1,
        serial: 'CA-0009',
        color: 'Azul',
        isRented: false,
      });
    });

    it('should translate unique constraint error to ConflictException', async () => {
      repo.findById.mockResolvedValue(makeDumpsterRow({ id: 1 }) as any);

      repo.update.mockRejectedValue({ code: 'P2002' });

      await expect(
        service.update(1, { serial: 'CA-0001' } as any),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });
});
