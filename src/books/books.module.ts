import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { BookDataAccess } from 'src/DataAccess/book-dataAccess';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Module({
  controllers: [BooksController],
  providers: [BooksService, PrismaService, BookDataAccess],
})
export class BooksModule {}
