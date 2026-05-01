import { Module } from '@nestjs/common';
import { CrudController } from './crud.controller';
import {
  CrudResourceControllers,
  CrudResourcesController,
} from './crud-resources.controller';
import { CrudService } from './crud.service';

@Module({
  controllers: [CrudController, CrudResourcesController, ...CrudResourceControllers],
  providers: [CrudService],
})
export class CrudModule {}
