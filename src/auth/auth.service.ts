import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from 'src/DTO/login-dto';
import { RegisterDto } from 'src/DTO/register-dto';
import { AuthDataAccess } from 'src/DataAccess/auth-dataAccess';

@Injectable()
export class AuthService {
  constructor(
    private authDataAccess: AuthDataAccess,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  private signAccessToken(payload: {
    userId: string;
    email: string;
    role: 'USER' | 'ADMIN';
  }) {
    return this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow('SECRET_KEY'),
      expiresIn: this.config.getOrThrow('JWT_ACCESS_EXPIRES_IN'),
    });
  }

  private signRefreshToken(payload: {
    userId: string;
    email: string;
    role: 'USER' | 'ADMIN';
  }) {
    return this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow('SECRET_KEY'),
      expiresIn: this.config.getOrThrow('JWT_REFRESH_EXPIRES_IN'),
    });
  }

  private async setRefreshHash(userId: string, refreshToken: string) {
    const refreshHash = await bcrypt.hash(refreshToken, 10);
    await this.authDataAccess.refreshHash(userId, refreshHash);
  }

  async register(dto: RegisterDto) {
    const exists = await this.authDataAccess.findByEmail(dto.email);
    if (exists) throw new BadRequestException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.authDataAccess.create(dto.email, passwordHash);

    const payload = { userId: user.id, email: user.email, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(payload),
      this.signRefreshToken(payload),
    ]);

    await this.setRefreshHash(user.id, refreshToken);

    return { user, accessToken, refreshToken };
  }

  async login(dto: LoginDto) {
    const user = await this.authDataAccess.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const payload = { userId: user.id, email: user.email, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(payload),
      this.signRefreshToken(payload),
    ]);

    await this.setRefreshHash(user.id, refreshToken);

    return {
      user: { id: user.id, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    };
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.authDataAccess.findById(userId);

    if (!user || !user.refreshHash)
      throw new ForbiddenException('Access denied');

    const match = await bcrypt.compare(refreshToken, user.refreshHash);
    if (!match) throw new ForbiddenException('Access denied');

    const payload = { userId: user.id, email: user.email, role: user.role };

    const [accessToken, newRefreshToken] = await Promise.all([
      this.signAccessToken(payload),
      this.signRefreshToken(payload),
    ]);

    await this.setRefreshHash(user.id, newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async verifyRefreshToken(token: string) {
    try {
      return await this.jwt.verifyAsync(token, {
        secret: this.config.getOrThrow('SECRET_KEY'),
      });
    } catch {
      throw new ForbiddenException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.authDataAccess.logout(userId);
    return { success: true };
  }
}
