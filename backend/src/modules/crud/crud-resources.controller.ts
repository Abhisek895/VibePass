import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Type,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CRUD_MODELS } from './crud-models';
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

type CrudDto = Record<string, unknown>;

function parseInteger(value?: string) {
  if (value === undefined) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function createCrudResourceController(
  modelName: string,
  routeName: string,
): Type<unknown> {
  @Controller(`api/v1/admin/${routeName}`)
  @UseGuards(JwtAuthGuard)
  class CrudResourceController {
    constructor(private readonly crudService: CrudService) {}

    private asPrismaArgs<T extends object>(dto: T) {
      return dto as CrudDto;
    }

    @Get()
    findMany(
      @Query('take') take?: string,
      @Query('skip') skip?: string,
    ) {
      return this.crudService.findMany(modelName, {
        take: parseInteger(take),
        skip: parseInteger(skip),
      });
    }

    @Post('query')
    query(@Body() dto: FindManyDto) {
      return this.crudService.findMany(modelName, this.asPrismaArgs(dto));
    }

    @Post('find-unique')
    findUnique(@Body() dto: FindUniqueDto) {
      return this.crudService.findUnique(modelName, this.asPrismaArgs(dto));
    }

    @Post('find-first')
    findFirst(@Body() dto: FindManyDto) {
      return this.crudService.findFirst(modelName, this.asPrismaArgs(dto));
    }

    @Post('count')
    count(@Body() dto: CountDto) {
      return this.crudService.count(modelName, this.asPrismaArgs(dto));
    }

    @Get(':id')
    findById(@Param('id') id: string) {
      return this.crudService.findById(modelName, id);
    }

    @Post()
    create(@Body() dto: CreateOneDto) {
      return this.crudService.create(modelName, this.asPrismaArgs(dto));
    }

    @Post('bulk/create')
    createMany(@Body() dto: CreateManyDto) {
      return this.crudService.createMany(modelName, this.asPrismaArgs(dto));
    }

    @Patch('bulk/update')
    updateMany(@Body() dto: UpdateManyDto) {
      return this.crudService.updateMany(modelName, this.asPrismaArgs(dto));
    }

    @Post('upsert')
    upsert(@Body() dto: UpsertDto) {
      return this.crudService.upsert(modelName, this.asPrismaArgs(dto));
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateOneDto) {
      return this.crudService.updateById(
        modelName,
        id,
        this.asPrismaArgs(dto),
      );
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
      return this.crudService.deleteById(modelName, id);
    }

    @Post('bulk/delete')
    deleteMany(@Body() dto: DeleteManyDto) {
      return this.crudService.deleteMany(modelName, this.asPrismaArgs(dto));
    }
  }

  Object.defineProperty(CrudResourceController, 'name', {
    value: `${modelName}AdminCrudController`,
  });

  return CrudResourceController;
}

@Controller('api/v1/admin/resources')
@UseGuards(JwtAuthGuard)
export class CrudResourcesController {
  constructor(private readonly crudService: CrudService) {}

  @Get()
  listResources() {
    return this.crudService.listModels().map(model => ({
      ...model,
      endpoints: {
        count: `/api/v1/admin/${model.route}/count`,
        create: `/api/v1/admin/${model.route}`,
        createMany: `/api/v1/admin/${model.route}/bulk/create`,
        delete: `/api/v1/admin/${model.route}/:id`,
        deleteMany: `/api/v1/admin/${model.route}/bulk/delete`,
        findById: `/api/v1/admin/${model.route}/:id`,
        findFirst: `/api/v1/admin/${model.route}/find-first`,
        findMany: `/api/v1/admin/${model.route}`,
        findUnique: `/api/v1/admin/${model.route}/find-unique`,
        query: `/api/v1/admin/${model.route}/query`,
        update: `/api/v1/admin/${model.route}/:id`,
        updateMany: `/api/v1/admin/${model.route}/bulk/update`,
        upsert: `/api/v1/admin/${model.route}/upsert`,
      },
    }));
  }
}

export const CrudResourceControllers = CRUD_MODELS.map(model =>
  createCrudResourceController(model.modelName, model.routeName),
);
