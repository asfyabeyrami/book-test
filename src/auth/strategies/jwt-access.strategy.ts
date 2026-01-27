import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as dotenv from 'dotenv';

dotenv.config();

export type JwtAccessPayload = {
  sub: string;
  email: string;
  role: 'USER' | 'ADMIN';
};

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('SECRET_KEY'),
    });
  }

  validate(payload: JwtAccessPayload) {
    // attach to req.user
    return payload;
  }
}
