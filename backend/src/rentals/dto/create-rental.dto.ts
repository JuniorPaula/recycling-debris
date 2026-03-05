import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateRentalDto {
  @ApiProperty({ example: 1, description: 'ID da caçamba' })
  @IsInt()
  @Min(1)
  dumpsterId: number;

  @ApiProperty({ example: '88340-000' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{5}-?\d{3}$/, {
    message: 'CEP inválido. Use 99999-999 ou 99999999',
  })
  cep: string;

  @ApiProperty({ example: 'Rua das Flores' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  street: string;

  @ApiProperty({ example: 'Centro' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  district: string;

  @ApiProperty({ example: 'Penha' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  city: string;
}
