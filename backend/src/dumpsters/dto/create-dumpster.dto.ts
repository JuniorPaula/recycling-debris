import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateDumpsterDto {
  @ApiProperty({ example: 'CA-000123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  serial: string;

  @ApiProperty({ example: 'Azul' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  color: string;
}
