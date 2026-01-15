import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('users') // Agrupa los endpoints en la sección de usuarios
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'usuario@ejemplo.com' },
        password: { type: 'string', example: 'password123' },
        firstName: { type: 'string', example: 'Nombre' },
        lastName: { type: 'string', example: 'Apellido' },
      },
      required: ['email', 'password', 'firstName', 'lastName']
    }
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Usuario creado exitosamente.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos inválidos.' })
  async create(
    @Body()
    createUserDto: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    },
  ) {
    return this.usersService.create(
      createUserDto.email,
      createUserDto.password,
      createUserDto.firstName,
      createUserDto.lastName,
    );
  }

  @ApiBearerAuth() // Indica que requiere token JWT
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Obtener lista de todos los usuarios' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de usuarios retornada correctamente.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado.' })
  async findAll() {
    return this.usersService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por su ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Usuario encontrado.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Usuario no encontrado.' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar datos de un usuario' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'nuevo@ejemplo.com' },
        password: { type: 'string', example: 'nuevapassword123', description: 'Opcional' },
      },
      required: ['email']
    }
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Usuario actualizado correctamente.' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: { email: string; password?: string },
  ) {
    return this.usersService.update(
      id,
      updateUserDto.email,
      updateUserDto.password,
    );
  }
}