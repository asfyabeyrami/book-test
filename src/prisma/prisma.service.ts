import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { prismaConfig } from './prisma.config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super(prismaConfig);
  }

  async onModuleInit() {
    await this.$connect();
  }
}
