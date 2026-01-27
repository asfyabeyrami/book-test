import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from 'src/DTO/login.dto';
import { RegisterDto } from 'src/DTO/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  private signAccessToken(payload: {
    sub: string;
    email: string;
    role: 'USER' | 'ADMIN';
  }) {
    return this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow('SECRET_KEY'),
      expiresIn: this.config.getOrThrow('JWT_ACCESS_EXPIRES_IN'),
    });
  }

  private signRefreshToken(payload: {
    sub: string;
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
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshHash },
    });
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new BadRequestException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email: dto.email, passwordHash },
      select: { id: true, email: true, role: true },
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(payload),
      this.signRefreshToken(payload),
    ]);

    await this.setRefreshHash(user.id, refreshToken);

    return { user, accessToken, refreshToken };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role };
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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshHash)
      throw new ForbiddenException('Access denied');

    const match = await bcrypt.compare(refreshToken, user.refreshHash);
    if (!match) throw new ForbiddenException('Access denied');

    const payload = { sub: user.id, email: user.email, role: user.role };

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
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshHash: null },
    });
    return { success: true };
  }
}
