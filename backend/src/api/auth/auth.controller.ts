import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { Public } from '../../decorators/publicURL';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    const response = await this.authService.login(req.user);
    return response;
  }

  @Public()
  @Post('refresh')
  async refresh(@Body('refresh_token') refreshToken: string) {
    return await this.authService.refreshToken(refreshToken);
  }
}
