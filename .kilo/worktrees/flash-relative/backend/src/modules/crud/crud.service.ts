import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { parseJsonField } from '../../common/utils/serialized-fields.util';
import { buildCrudModelLookup, CRUD_MODELS } from './crud-models';

type PrismaArgs = Record<string, unknown>;

interface PrismaDelegate {
  findMany(args?: PrismaArgs): Promise<unknown>;
  findUnique(args?: PrismaArgs): Promise<unknown>;
  findFirst?(args?: PrismaArgs): Promise<unknown>;
  count(args?: PrismaArgs): Promise<unknown>;
  create(args?: PrismaArgs): Promise<unknown>;
  createMany?(args?: PrismaArgs): Promise<unknown>;
  update(args?: PrismaArgs): Promise<unknown>;
  updateMany?(args?: PrismaArgs): Promise<unknown>;
  upsert?(args?: PrismaArgs): Promise<unknown>;
  delete(args?: PrismaArgs): Promise<unknown>;
  deleteMany?(args?: PrismaArgs): Promise<unknown>;
}

@Injectable()
export class CrudService {
  private readonly sensitiveFields = new Set(['passwordHash']);
  private readonly jsonStringFields = new Set(['attributes', 'interests']);
  private readonly supportedModels = CRUD_MODELS;
  private readonly modelLookup = buildCrudModelLookup();

  constructor(private readonly prisma: PrismaService) {}

  listModels() {
    return this.supportedModels.map(model => ({
      model: model.modelName,
      route: model.routeName,
      delegate: model.delegateName,
    }));
  }

  async findMany(model: string, args: PrismaArgs = {}) {
    const query = { take: 100, ...args };
    return this.run(model, 'findMany', query);
  }

  async findUnique(model: string, args: PrismaArgs) {
    const record = await this.run(model, 'findUnique', args);
    if (!record) {
      throw new NotFoundException('Record not found');
    }

    return record;
  }

  async findFirst(model: string, args: PrismaArgs = {}) {
    const record = await this.run(model, 'findFirst', args);
    if (!record) {
      throw new NotFoundException('Record not found');
    }

    return record;
  }

  async count(model: string, args: PrismaArgs = {}) {
    return this.run(model, 'count', args);
  }

  async findById(model: string, id: string) {
    return this.findUnique(model, { where: { id } });
  }

  async create(model: string, args: PrismaArgs) {
    return this.run(model, 'create', args);
  }

  async createMany(model: string, args: PrismaArgs) {
    return this.run(model, 'createMany', args);
  }

  async updateById(model: string, id: string, args: PrismaArgs) {
    return this.run(model, 'update', {
      ...args,
      where: { id },
    });
  }

  async updateMany(model: string, args: PrismaArgs) {
    return this.run(model, 'updateMany', args);
  }

  async upsert(model: string, args: PrismaArgs) {
    return this.run(model, 'upsert', args);
  }

  async deleteById(model: string, id: string) {
    return this.run(model, 'delete', { where: { id } });
  }

  async deleteMany(model: string, args: PrismaArgs = {}) {
    return this.run(model, 'deleteMany', args);
  }

  private getDelegate(model: string): PrismaDelegate {
    const resolvedModel = this.modelLookup.get(model.trim().toLowerCase());

    if (!resolvedModel) {
      const supported = this.supportedModels.map(item => item.routeName).join(', ');
      throw new BadRequestException(
        `Unsupported model "${model}". Supported models: ${supported}`,
      );
    }

    const delegate = (this.prisma as unknown as Record<string, unknown>)[
      resolvedModel.delegateName
    ];

    if (!delegate || typeof delegate !== 'object') {
      throw new BadRequestException(
        `Prisma delegate "${resolvedModel.delegateName}" is not available.`,
      );
    }

    return delegate as PrismaDelegate;
  }

  private async run(
    model: string,
    action: keyof PrismaDelegate,
    args?: PrismaArgs,
  ) {
    const delegate = this.getDelegate(model);
    const method = delegate[action];

    if (typeof method !== 'function') {
      throw new BadRequestException(
        `The "${String(action)}" operation is not available for model "${model}".`,
      );
    }

    try {
      const result = await method.call(delegate, args);
      return this.serialize(result);
    } catch (error) {
      throw this.translatePrismaError(error);
    }
  }

  private translatePrismaError(error: unknown) {
    if (error instanceof BadRequestException || error instanceof NotFoundException) {
      return error;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          return new ConflictException('A record with the same unique field already exists.');
        case 'P2003':
          return new BadRequestException('A related record was not found or violates a foreign key constraint.');
        case 'P2025':
          return new NotFoundException('Record not found.');
        default:
          return new BadRequestException(error.message);
      }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      return new BadRequestException(error.message);
    }

    if (error instanceof Error) {
      return new BadRequestException(error.message);
    }

    return new BadRequestException('The requested database operation failed.');
  }

  private serialize(value: unknown): unknown {
    if (typeof value === 'bigint') {
      return value.toString();
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (Array.isArray(value)) {
      return value.map(item => this.serialize(item));
    }

    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value)
          .filter(([key]) => !this.sensitiveFields.has(key))
          .map(([key, currentValue]) => {
            if (
              this.jsonStringFields.has(key) &&
              typeof currentValue === 'string'
            ) {
              return [key, parseJsonField(currentValue)];
            }

            return [key, this.serialize(currentValue)];
          }),
      );
    }

    return value;
  }
}
