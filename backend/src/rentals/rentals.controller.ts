import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { RentalsService } from './rentals.service';
import { CreateRentalDto } from './dto/create-rental.dto';

@ApiTags('Rentals')
@Controller('rentals')
export class RentalsController {
  constructor(private readonly service: RentalsService) {}

  @Post()
  @ApiOperation({ summary: 'Alugar uma caçamba' })
  create(@Body() dto: CreateRentalDto) {
    return this.service.create(dto);
  }

  @Get('dumpster/:dumpsterId')
  @ApiOperation({ summary: 'Histórico de aluguéis por caçamba' })
  @ApiParam({ name: 'dumpsterId', type: Number })
  listByDumpster(@Param('dumpsterId', ParseIntPipe) dumpsterId: number) {
    return this.service.listByDumpster(dumpsterId);
  }

  @Patch(':id/finish')
  @ApiOperation({ summary: 'Finalizar aluguel' })
  @ApiParam({ name: 'id', type: Number })
  finish(@Param('id', ParseIntPipe) id: number) {
    return this.service.finish(id);
  }
}
