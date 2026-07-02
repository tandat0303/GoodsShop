import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Strategy } from 'passport-local';
import { Request } from 'express';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  async validate(req: Request): Promise<any> {
    const { email, password } = req.body;

    let checkExist = await this.authService.checkExistUser(email);
    if (!checkExist) {
      throw new UnauthorizedException(
        'Có tài khoản đâu mà dzô! Kêu thèn Đạt tạo cho :>>>',
      );
    }

    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Sai sai cái gì gòi đó!');
    }
    return user;
  }
}
