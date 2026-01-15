import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
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
  async register(@Body() body: any) {
    return this.authService.register(body);
  }
}
