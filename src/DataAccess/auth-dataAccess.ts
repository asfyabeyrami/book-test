import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class AuthDataAccess {
  constructor(private readonly prismaService: PrismaService) {}

  async create(email: string, passwordHash: string) {
    try {
      const user = await this.prismaService.user.create({
        data: { email: email, passwordHash },
        select: { id: true, email: true, role: true },
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, email?: string, passwordHash?: string) {
    try {
      const user = await this.prismaService.user.update({
        where: { id },
        data: { email, passwordHash },
        select: { id: true, email: true, role: true },
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.prismaService.user.findMany();
    } catch (error) {
      throw error;
    }
  }

  async findById(id: string) {
    try {
      return await this.prismaService.user.findUnique({ where: { id } });
    } catch (error) {
      throw error;
    }
  }

  async findByEmail(email: string) {
    try {
      return await this.prismaService.user.findUnique({ where: { email } });
    } catch (error) {
      throw error;
    }
  }

  async refreshHash(userId: string, refreshHash: string) {
    try {
      await this.prismaService.user.update({
        where: { id: userId },
        data: { refreshHash },
      });
    } catch (error) {
      throw error;
    }
  }

  async logout(userId: string) {
    try {
      await this.prismaService.user.update({
        where: { id: userId },
        data: { refreshHash: null },
      });
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}
