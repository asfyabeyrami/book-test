import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto, UpdateBookDto } from 'src/DTO/create-book.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('books')
export class BooksController {
  constructor(private books: BooksService) {}

  @Post()
  create(@Body() dto: CreateBookDto) {
    return this.books.create(dto);
  }

  @Get()
  findAll() {
    return this.books.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.books.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBookDto) {
    return this.books.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.books.remove(id);
  }
}
