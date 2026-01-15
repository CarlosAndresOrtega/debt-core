import { Controller, Post, Body, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('auth') // Categoriza los endpoints en la interfaz de Swagger
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Inicio de sesión de usuario' }) // Descripción de la operación
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'correo@ejemplo.com' },
        password: { type: 'string', example: '123456' }
      },
      required: ['email', 'password']
    }
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Login exitoso y retorno de JWT.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Credenciales inválidas.' })
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(
      body.email,
      body.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const loginResponse = await this.authService.login(user);

    return {
      ...loginResponse,
      user: {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  @Post('register')
  @ApiOperation({ summary: 'Registro de nuevo usuario' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', example: 'Juan' },
        lastName: { type: 'string', example: 'Pérez' },
        email: { type: 'string', example: 'juan.perez@ejemplo.com' },
        password: { type: 'string', example: 'password123' }
      },
      required: ['firstName', 'lastName', 'email', 'password']
    }
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Usuario registrado con éxito.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos de registro inválidos o correo ya existente.' })
  async register(@Body() body: any) {
    return this.authService.register(body);
  }
}