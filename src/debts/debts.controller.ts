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
} from '@nestjs/common';
import { DebtsService } from './debts.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('debts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(CacheInterceptor)
@Controller('debts')
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  @Post()
  create(@Body() createDebtDto: CreateDebtDto, @Request() req) {
    return this.debtsService.create(createDebtDto, req.user.id);
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
  getStats() {
    return this.debtsService.getStats();
  }

  @Patch(':id/pay')
  markAsPaid(@Param('id') id: string, @Request() req) {
    return this.debtsService.markAsPaid(id, req.user.sub); // req.user.sub es el ID del usuario logueado
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
