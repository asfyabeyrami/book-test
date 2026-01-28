import { Injectable } from '@nestjs/common';
import { CreateBookDto, UpdateBookDto } from 'src/DTO/create-book-dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class BookDataAccess {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateBookDto, userId: string) {
    return this.prismaService.book.create({
      data: {
        title: dto.title,
        authorId: userId,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
      },
    });
  }

  async findAll() {
    return this.prismaService.book.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
  }

  async findOne(id: string) {
    const book = await this.prismaService.book.findUnique({
      where: { id },
      include: { user: true },
    });
    return book;
  }

  async update(id: string, dto: UpdateBookDto, userId: string) {
    await this.findOne(id);
    return this.prismaService.book.update({
      where: { id },
      data: {
        title: dto.title,
        authorId: userId,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prismaService.book.delete({ where: { id } });
    return { success: true };
  }
}
