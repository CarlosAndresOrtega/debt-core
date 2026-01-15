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
  // @UseInterceptors(CacheInterceptor)
  findAll(
    @Query('page') page: number = 1,
    @Query('size') size: number = 10,
    @Query() filters: any,
  ) {
    const { page: p, size: s, ...queryFilters } = filters;
    return this.debtsService.findAll(+page, +size, queryFilters);
  }

  @Get('stats')
  @UseInterceptors(CacheInterceptor)
  getStats() {
    return this.debtsService.getStats();
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

  @Get('export/json')
  async exportJson() {
    const result = await this.debtsService.findAll(1, 10000);
    return {
      reportDate: new Date().toISOString(),
      totalRecords: result.pagination.totalItems,
      data: result.items,
    };
  }
}