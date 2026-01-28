import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

export const prismaConfig = {
  adapter: new PrismaPg(
    new Pool({
      connectionString:
        'postgresql://postgres:123456789@localhost:5432/book?schema=public',
    }),
  ),
};
