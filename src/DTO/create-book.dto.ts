import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateBookDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  @MinLength(1)
  author: string;

  @ApiProperty({
    type: String,
  })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}

export class UpdateBookDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  @MinLength(1)
  author: string;

  @ApiProperty({
    type: String,
  })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
