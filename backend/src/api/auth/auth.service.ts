import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserPayload } from '../../types/users';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async checkExistUser(email: string) {
    return await this.usersService.checkExistUser(email);
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.validateUser(email, password);
    return user;
  }

  async login(user: UserPayload) {
    const payload = { ...user };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return {
      user: payload,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify<UserPayload>(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const { iat, exp, ...userPayload } = payload as any;

      const newAccessToken = this.jwtService.sign(userPayload);
      const newRefreshToken = this.jwtService.sign(userPayload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      });

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (e) {
      throw new UnauthorizedException('Refresh token is invalid or expired!');
    }
  }
}
