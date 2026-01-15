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

  async create(createDebtDto: any) {
    const { id, userId, ...debtData } = createDebtDto;
    const newDebt = this.debtRepository.create({
      ...debtData,
      createdAt: new Date(), // Forzamos la fecha del servidor
      user: { userId: userId },
    });
    const saved = (await this.debtRepository.save(newDebt)) as Debt | Debt[];
    console.log(
      'Registro 24 creado con ID:',
      Array.isArray(saved) ? (saved[0] as Debt)?.id : (saved as Debt).id,
    ); 
    return saved;
  }

  async findAll(page: number, size: number, filters?: any) {
    const where: any = {};

    if (filters?.isPaid !== undefined && filters?.isPaid !== '') {
      where.isPaid = filters.isPaid === 'true';
    }

    const searchTerms = filters?.query || filters?.description;
    if (searchTerms) {
      where.description = ILike(`%${searchTerms}%`);
    }

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

    if (filters?.userId) {
      where.user = { userId: filters.userId };
    }

    if (filters?.paidByUserId) {
      where.paidByUserId = filters.paidByUserId;
    }

    if (filters?.dateFrom && filters?.dateTo) {
      const start = new Date(filters.dateFrom);
      start.setUTCHours(0, 0, 0, 0);
    
      const end = new Date(filters.dateTo);
      end.setUTCHours(23, 59, 59, 999);
    
      where.createdAt = Between(start, end);
    }


    const [items, totalItems] = await this.debtRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: Number(size),
      skip: (Number(page) - 1) * Number(size),
      relations: ['user', 'paidByUser'],
      loadEagerRelations: false,
    });

    return {
      items,
      pagination: {
        totalItems, 
        pageSize: Number(size),
        currentPage: Number(page),
        totalPages: Math.ceil(totalItems / Number(size)),
      },
    };
  }
  async findOne(id: string) {
    const debt = await this.debtRepository.findOne({
      where: { id },
      relations: ['user', 'paidByUser'],
    });
    if (!debt) throw new NotFoundException('Deuda no encontrada');
    return debt;
  }
  async update(id: string, updateDebtDto: UpdateDebtDto) {
    const debt = await this.findOne(id);

    if (debt.isPaid) {
      throw new BadRequestException('No puedes modificar una deuda ya pagada');
    }

    if (updateDebtDto.amount !== undefined && updateDebtDto.amount < 0) {
      throw new BadRequestException('El monto no puede ser negativo');
    }

    Object.assign(debt, updateDebtDto);
    return await this.debtRepository.save(debt);
  }

  async remove(id: string) {
    const debt = await this.findOne(id);
    if (debt.isPaid) {
      throw new BadRequestException('No puedes eliminar una deuda ya pagada');
    }
    return await this.debtRepository.remove(debt);
  }

  async markAsPaid(id: string, paidByUserId: string) {
    const debt = await this.findOne(id);

    debt.isPaid = true;
    debt.paidByUserId = paidByUserId;

    return await this.debtRepository.save(debt);
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
      .getRawOne();

    return {
      pendingBalance: parseFloat(stats.pendingBalance || 0),
      totalPaid: parseFloat(stats.totalPaid || 0),
    };
  }
}
