import { UserPayload } from '../../../types/users';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'defaultSecret'),
    });
  }

  validate(payload: UserPayload) {
    return {
      id: payload.id,
      email: payload.email,
      fullName: payload.fullName,
      role: payload.role,
    };
  }
}
