import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class ListDumpstersQueryDto {
  @ApiPropertyOptional({
    example: 'CA-00',
    description: 'Filtra por serial (contém)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  serial?: string;

  @ApiPropertyOptional({ example: 'available', enum: ['available', 'rented'] })
  @IsOptional()
  @IsIn(['available', 'rented'])
  status?: 'available' | 'rented';
}
