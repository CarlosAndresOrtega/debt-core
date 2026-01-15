import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  Query,
  Inject,
  Res,
} from '@nestjs/common';
import { DebtsService } from './debts.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CacheInterceptor, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@ApiTags('debts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('debts')
export class DebtsController {
  constructor(
    private readonly debtsService: DebtsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Post()
  async create(@Body() createDebtDto: any) {
    const result = await this.debtsService.create(createDebtDto);
    await this.cacheManager.del('/debts');
    return result;
  }

  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('size') size: number = 10,
    @Query() filters: any,
  ) {
    const { page: p, size: s, ...queryFilters } = filters;
    return this.debtsService.findAll(+page, +size, queryFilters);
  }

  @Get('stats')
  async getStats() {
    const stats = await this.debtsService.calculateStats();
    return {
      ...stats,
      totalAmount: stats.totalPaid + stats.pendingBalance,
    };
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  findOne(@Param('id') id: string) {
    return this.debtsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDebtDto: any) {
    const result = await this.debtsService.update(id, updateDebtDto);
    await this.cacheManager.del('/debts');
    return result;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.debtsService.remove(id);
    await this.cacheManager.del('/debts');
    return result;
  }

  @Patch(':id/pay')
  async markAsPaid(@Param('id') id: string, @Body('userId') userId: string) {
    const result = await this.debtsService.markAsPaid(id, userId);
    await this.cacheManager.del('/debts');
    return result;
  }

  @Get('export/csv')
  async exportCsv(@Query() filters: any, @Res() res) {
    const csvData = await this.debtsService.exportToCsv(filters);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=deudas.csv');
    return res.send(csvData);
  }
}
