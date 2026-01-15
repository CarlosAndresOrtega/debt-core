import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  UseInterceptors,
  Query,
  Inject,
  Res,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { DebtsService } from './debts.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CacheInterceptor, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@ApiTags('debts') // Organiza los endpoints bajo la categoría "debts"
@ApiBearerAuth() // Indica que este controlador requiere el Token JWT
@UseGuards(JwtAuthGuard)
@Controller('debts')
export class DebtsController {
  constructor(
    private readonly debtsService: DebtsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva deuda' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Deuda creada correctamente.' })
  async create(@Body() createDebtDto: any) {
    const result = await this.debtsService.create(createDebtDto);
    await this.cacheManager.del('/debts');
    return result;
  }

  @Get()
  @ApiOperation({ summary: 'Obtener listado de deudas paginado con filtros' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'size', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'description', required: false, type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Listado obtenido con éxito.' })
  findAll(
    @Query('page') page: number = 1,
    @Query('size') size: number = 10,
    @Query() filters: any,
  ) {
    const { page: p, size: s, ...queryFilters } = filters;
    return this.debtsService.findAll(+page, +size, queryFilters);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener balance general (Total, Pagado, Pendiente)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Estadísticas calculadas correctamente.' })
  async getStats() {
    const stats = await this.debtsService.calculateStats();
    return {
      ...stats,
      totalAmount: stats.totalPaid + stats.pendingBalance,
    };
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Obtener una deuda específica por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Deuda encontrada.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No existe la deuda.' })
  findOne(@Param('id') id: string) {
    return this.debtsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar información de una deuda' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Actualización exitosa.' })
  async update(@Param('id') id: string, @Body() updateDebtDto: any) {
    const result = await this.debtsService.update(id, updateDebtDto);
    await this.cacheManager.del('/debts');
    return result;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una deuda permanentemente' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Deuda eliminada.' })
  async remove(@Param('id') id: string) {
    const result = await this.debtsService.remove(id);
    await this.cacheManager.del('/debts');
    return result;
  }

  @Patch(':id/pay')
  @ApiOperation({ summary: 'Marcar una deuda como pagada' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Estado de pago actualizado.' })
  async markAsPaid(@Param('id') id: string, @Body('userId') userId: string) {
    const result = await this.debtsService.markAsPaid(id, userId);
    await this.cacheManager.del('/debts');
    return result;
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Exportar deudas filtradas a formato CSV' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Archivo generado exitosamente.' })
  async exportCsv(@Query() filters: any, @Res() res) {
    const csvData = await this.debtsService.exportToCsv(filters);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=deudas.csv');
    return res.send(csvData);
  }
}