import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from 'src/DTO/register-dto';
import { LoginDto } from 'src/DTO/login-dto';
import { Public, Roles } from 'src/common/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  private setRefreshCookie(res: Response, token: string) {
    const name = process.env.REFRESH_COOKIE_NAME || 'refresh_token';
    res.cookie(name, token, {
      httpOnly: true,
      secure: String(process.env.COOKIE_SECURE) === 'true',
      sameSite: 'lax',
      path: '/auth/refresh',
    });
  }

  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: any,
  ) {
    const result = await this.auth.register(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return { user: result.user, accessToken: result.accessToken };
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: any) {
    const result = await this.auth.login(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return { user: result.user, accessToken: result.accessToken };
  }

  @Public()
  @ApiBearerAuth()
  @Post('refresh')
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: any) {
    console.log('ssssssss', req.cookies);
    const token = req.cookies['refresh_token'];

    if (!token) throw new UnauthorizedException('No refresh token');

    const payload = await this.auth.verifyRefreshToken(token);
    const tokens = await this.auth.refresh(payload.sub, token);

    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Roles(Role.USER)
  @ApiBearerAuth()
  @Post('logout')
  async logout(@Req() req: any, @Res({ passthrough: true }) res: any) {
    const name = process.env.REFRESH_COOKIE_NAME || 'refresh_token';
    res.clearCookie(name, { path: '/auth/refresh' });
    return this.auth.logout(req.user.sub);
  }

  @ApiBearerAuth()
  @Roles(Role.USER)
  @Get('me')
  me(@Req() req: any) {
    return req.user;
  }
}
