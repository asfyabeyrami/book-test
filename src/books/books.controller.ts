import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from 'src/common/decorators/userIdfromReq.decorators';
import { CreateBookDto, UpdateBookDto } from 'src/DTO/create-book-dto';
import { BooksService } from './books.service';

@ApiBearerAuth()
@Controller('books')
export class BooksController {
  constructor(private booksService: BooksService) {}

  @Post()
  async create(@Body() dto: CreateBookDto, @User('userId') userId: string) {
    try {
      return this.booksService.create(dto, userId);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  async findAll() {
    try {
      return this.booksService.findAll();
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return this.booksService.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBookDto,
    @User('userId') userId: string,
  ) {
    try {
      return this.booksService.update(id, dto, userId);
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return this.booksService.remove(id);
    } catch (error) {
      throw error;
    }
  }
}
