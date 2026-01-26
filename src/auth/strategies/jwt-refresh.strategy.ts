import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';

export type JwtRefreshPayload = {
  sub: string;
  email: string;
  role: 'USER' | 'ADMIN';
};

function cookieExtractor(req: Request): string | null {
  if (req && req.cookies) return req.cookies[process.env.REFRESH_COOKIE_NAME || 'refresh_token'] ?? null;
  return null;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: cookieExtractor,
      secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtRefreshPayload) {
    const token = cookieExtractor(req);
    if (!token) throw new UnauthorizedException('Missing refresh token');
    return { ...payload, refreshToken: token };
  }
}