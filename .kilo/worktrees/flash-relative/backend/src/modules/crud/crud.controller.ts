import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CrudService } from './crud.service';
import {
  CountDto,
  CreateManyDto,
  CreateOneDto,
  DeleteManyDto,
  FindManyDto,
  FindUniqueDto,
  UpdateManyDto,
  UpdateOneDto,
  UpsertDto,
} from './dto/crud.dto';

@Controller('api/v1/crud')
@UseGuards(JwtAuthGuard)
export class CrudController {
  constructor(private readonly crudService: CrudService) {}

  private asPrismaArgs<T extends object>(dto: T) {
    return dto as Record<string, unknown>;
  }

  @Get('models')
  listModels() {
    return this.crudService.listModels();
  }

  @Post(':model/find-many')
  findMany(@Param('model') model: string, @Body() dto: FindManyDto) {
    return this.crudService.findMany(model, this.asPrismaArgs(dto));
  }

  @Post(':model/find-unique')
  findUnique(@Param('model') model: string, @Body() dto: FindUniqueDto) {
    return this.crudService.findUnique(model, this.asPrismaArgs(dto));
  }

  @Post(':model/find-first')
  findFirst(@Param('model') model: string, @Body() dto: FindManyDto) {
    return this.crudService.findFirst(model, this.asPrismaArgs(dto));
  }

  @Post(':model/count')
  count(@Param('model') model: string, @Body() dto: CountDto) {
    return this.crudService.count(model, this.asPrismaArgs(dto));
  }

  @Post(':model/create-many')
  createMany(@Param('model') model: string, @Body() dto: CreateManyDto) {
    return this.crudService.createMany(model, this.asPrismaArgs(dto));
  }

  @Patch(':model/update-many')
  updateMany(@Param('model') model: string, @Body() dto: UpdateManyDto) {
    return this.crudService.updateMany(model, this.asPrismaArgs(dto));
  }

  @Post(':model/upsert')
  upsert(@Param('model') model: string, @Body() dto: UpsertDto) {
    return this.crudService.upsert(model, this.asPrismaArgs(dto));
  }

  @Post(':model/delete-many')
  deleteMany(@Param('model') model: string, @Body() dto: DeleteManyDto) {
    return this.crudService.deleteMany(model, this.asPrismaArgs(dto));
  }

  @Get(':model')
  findManyFromQuery(
    @Param('model') model: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    const parsedTake = take !== undefined ? Number.parseInt(take, 10) : undefined;
    const parsedSkip = skip !== undefined ? Number.parseInt(skip, 10) : undefined;

    return this.crudService.findMany(model, {
      take: Number.isNaN(parsedTake) ? undefined : parsedTake,
      skip: Number.isNaN(parsedSkip) ? undefined : parsedSkip,
    });
  }

  @Get(':model/:id')
  findById(@Param('model') model: string, @Param('id') id: string) {
    return this.crudService.findById(model, id);
  }

  @Post(':model')
  create(@Param('model') model: string, @Body() dto: CreateOneDto) {
    return this.crudService.create(model, this.asPrismaArgs(dto));
  }

  @Patch(':model/:id')
  update(
    @Param('model') model: string,
    @Param('id') id: string,
    @Body() dto: UpdateOneDto,
  ) {
    return this.crudService.updateById(model, id, this.asPrismaArgs(dto));
  }

  @Delete(':model/:id')
  delete(@Param('model') model: string, @Param('id') id: string) {
    return this.crudService.deleteById(model, id);
  }
}
