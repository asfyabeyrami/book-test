import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

export const prismaConfig = (config: ConfigService) => ({
  adapter: new PrismaPg(
    new Pool({
      connectionString: config.get<string>('DATABASE_URL'),
    }),
  ),
});
