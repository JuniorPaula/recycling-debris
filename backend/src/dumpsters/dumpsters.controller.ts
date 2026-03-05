import {
  Controller,
  Body,
  Post,
  Get,
  Query,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DumpstersService } from './dumpsters.service';
import { CreateDumpsterDto } from './dto/create-dumpster.dto';
import { ListDumpstersQueryDto } from './dto/list-dumpsters.query';
import { UpdateDumpsterDto } from './dto/update-dumpster.dto';

@ApiTags('Dumpsters')
@Controller('dumpsters')
export class DumpstersController {
  constructor(private readonly service: DumpstersService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar caçamba' })
  create(@Body() dto: CreateDumpsterDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar caçambas' })
  @ApiQuery({
    name: 'serial',
    required: false,
    description: 'Filtra por serial (contém)',
  })
  @ApiQuery({ name: 'status', required: false, enum: ['available', 'rented'] })
  findAll(@Query() query: ListDumpstersQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhar caçamba' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar caçamba' })
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDumpsterDto,
  ) {
    return this.service.update(id, dto);
  }
}
