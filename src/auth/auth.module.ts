import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import * as dotenv from 'dotenv';
import { AuthDataAccess } from 'src/DataAccess/auth-dataAccess';
import { PrismaService } from 'src/common/prisma/prisma.service';

dotenv.config();

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '5h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, AuthDataAccess],
  exports: [AuthService],
})
export class AuthModule {}
