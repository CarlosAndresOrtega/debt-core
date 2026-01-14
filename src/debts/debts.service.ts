import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async findAll(page: number, size: number, params?: any) {
    const where: any = {};
  
    if (params?.isPaid !== undefined) {
      where.isPaid = params.isPaid === 'true';
    }
  
    const [items, totalItems] = await this.debtRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: size,
      skip: (page - 1) * size,
      relations: ['user']
    });
  
    return {
      items,
      pagination: { totalItems, pageSize: size, currentPage: page }
    };
  }
  async markAsPaid(id: string) {
    const debt = await this.debtRepository.findOneBy({ id: id.toString() });
    if (!debt) throw new NotFoundException('Deuda no encontrada');

    return await this.debtRepository.save({ ...debt, isPaid: true });
  }

  async getStats() {
    const stats = await this.debtRepository
      .createQueryBuilder('debt')
      .select('SUM(CASE WHEN debt.isPaid = false THEN CAST(debt.amount AS DECIMAL) ELSE 0 END)', 'pendingBalance')
      .addSelect('SUM(CASE WHEN debt.isPaid = true THEN CAST(debt.amount AS DECIMAL) ELSE 0 END)', 'totalPaid')
      .getRawOne(); // Quitamos el .where()
  
    return {
      pendingBalance: parseFloat(stats.pendingBalance || 0),
      totalPaid: parseFloat(stats.totalPaid || 0),
    };
  }

  async update(id: string, updateDebtDto: UpdateDebtDto) {
    const debt = await this.debtRepository.findOneBy({ id });
    
    if (!debt) throw new NotFoundException('Deuda no encontrada');
  
    // REGLA OBLIGATORIA: Una deuda pagada no puede ser modificada
    if (debt.isPaid) {
      throw new BadRequestException('No puedes modificar una deuda que ya ha sido pagada');
    }
  
    Object.assign(debt, updateDebtDto);
    return await this.debtRepository.save(debt);
  }

  getFilters() {
    const filters = [
      {
        label: 'Estado de Pago',
        queryParam: 'isPaid',
        values: [
          { id: 'true', name: 'Pagadas', selected: false },
          { id: 'false', name: 'Pendientes', selected: false }
        ]
      },
      {
        label: 'Monto Mayor a',
        queryParam: 'minAmount',
        values: [
          { id: '100', name: '> $100', selected: false },
          { id: '500', name: '> $500', selected: false },
          { id: '1000', name: '> $1000', selected: false }
        ]
      }
    ];
    return filters;
  }
}
