import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, ILike, Repository } from 'typeorm';
import { Debt } from './entities/debt.entity';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';

@Injectable()
export class DebtsService {
  constructor(
    @InjectRepository(Debt)
    private readonly debtRepository: Repository<Debt>,
  ) {}

  async create(createDebtDto: CreateDebtDto, userId: number) {
    const newDebt = this.debtRepository.create({
      ...createDebtDto,
      user: { id: userId } as any,
    });
    return await this.debtRepository.save(newDebt);
  }

  async findAll(page: number, size: number, filters?: any) {
    const where: any = {};

    // 1. Filtro por Estado (Solo si existe y no es string vacío)
    if (filters?.isPaid !== undefined && filters?.isPaid !== '') {
      where.isPaid = filters.isPaid === 'true';
    }

    // 2. Filtro por Descripción (Unificado: usa 'query' o 'description')
    const searchTerms = filters?.query || filters?.description;
    if (searchTerms) {
      where.description = ILike(`%${searchTerms}%`);
    }

    // 3. Filtro de rango para Monto
    if (
      filters?.amountMin !== undefined &&
      filters?.amountMax !== undefined &&
      filters?.amountMin !== '' &&
      filters?.amountMax !== ''
    ) {
      where.amount = Between(
        Number(filters.amountMin),
        Number(filters.amountMax),
      );
    }

    // 4. Filtro por Dueño
    if (filters?.userId) {
      where.user = { userId: filters.userId };
    }

    // 5. Filtro por quién pagó
    if (filters?.paidByUserId) {
      where.paidByUserId = filters.paidByUserId;
    }

    // 6. Filtro por rango de fechas
    if (filters?.dateFrom && filters?.dateTo) {
      const start = new Date(filters.dateFrom);
      start.setHours(0, 0, 0, 0);

      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);

      where.createdAt = Between(start, end);
    }

    const [items, totalItems] = await this.debtRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: size,
      skip: (page - 1) * size,
      relations: ['user', 'paidByUser'],
    });

    return {
      items,
      pagination: {
        totalItems,
        pageSize: size,
        currentPage: page,
        totalPages: Math.ceil(totalItems / size),
      },
    };
  }

  async markAsPaid(id: string, paidByUserId: string) {
    return this.debtRepository.update(id, {
      isPaid: true,
      paidByUserId: paidByUserId,
    });
  }
  async getStats() {
    const stats = await this.debtRepository
      .createQueryBuilder('debt')
      .select(
        'SUM(CASE WHEN debt.isPaid = false THEN CAST(debt.amount AS DECIMAL) ELSE 0 END)',
        'pendingBalance',
      )
      .addSelect(
        'SUM(CASE WHEN debt.isPaid = true THEN CAST(debt.amount AS DECIMAL) ELSE 0 END)',
        'totalPaid',
      )
      .getRawOne(); // Quitamos el .where()

    return {
      pendingBalance: parseFloat(stats.pendingBalance || 0),
      totalPaid: parseFloat(stats.totalPaid || 0),
    };
  }

  async update(id: string, updateDebtDto: UpdateDebtDto) {
    const debt = await this.debtRepository.findOneBy({ id });

    if (!debt) throw new NotFoundException('Deuda no encontrada');

    if (debt.isPaid) {
      throw new BadRequestException(
        'No puedes modificar una deuda que ya ha sido pagada',
      );
    }

    Object.assign(debt, updateDebtDto);
    return await this.debtRepository.save(debt);
  }
}
