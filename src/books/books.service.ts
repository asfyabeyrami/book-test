import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto, UpdateBookDto } from 'src/DTO/create-book-dto';
import { BookDataAccess } from 'src/DataAccess/book-dataAccess';

@Injectable()
export class BooksService {
  constructor(private readonly bookDataAccess: BookDataAccess) {}

  async create(dto: CreateBookDto, userId: string) {
    try {
      const result = await this.bookDataAccess.create(dto, userId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.bookDataAccess.findAll();
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const book = await this.bookDataAccess.findOne(id);
      if (!book) throw new NotFoundException('Book not found');
      return book;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, dto: UpdateBookDto, userId: string) {
    try {
      const book = await this.findOne(id);
      if (!book) throw new NotFoundException('Book not found');

      return await this.bookDataAccess.update(id, dto, userId);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const book = await this.findOne(id);
      if (!book) throw new NotFoundException('Book not found');

      await this.bookDataAccess.remove(id);
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}
