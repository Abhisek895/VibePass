import { Allow, IsOptional } from 'class-validator';

export class FindManyDto {
  @IsOptional()
  @Allow()
  where?: Record<string, unknown>;

  @IsOptional()
  @Allow()
  orderBy?: unknown;

  @IsOptional()
  @Allow()
  cursor?: Record<string, unknown>;

  @IsOptional()
  @Allow()
  take?: number;

  @IsOptional()
  @Allow()
  skip?: number;

  @IsOptional()
  @Allow()
  distinct?: unknown;

  @IsOptional()
  @Allow()
  include?: Record<string, unknown>;

  @IsOptional()
  @Allow()
  select?: Record<string, unknown>;
}

export class FindUniqueDto {
  @Allow()
  where!: Record<string, unknown>;

  @IsOptional()
  @Allow()
  include?: Record<string, unknown>;

  @IsOptional()
  @Allow()
  select?: Record<string, unknown>;
}

export class CountDto {
  @IsOptional()
  @Allow()
  where?: Record<string, unknown>;

  @IsOptional()
  @Allow()
  orderBy?: unknown;

  @IsOptional()
  @Allow()
  cursor?: Record<string, unknown>;

  @IsOptional()
  @Allow()
  take?: number;

  @IsOptional()
  @Allow()
  skip?: number;

  @IsOptional()
  @Allow()
  distinct?: unknown;

  @IsOptional()
  @Allow()
  select?: Record<string, unknown>;
}

export class CreateOneDto {
  @Allow()
  data!: Record<string, unknown>;

  @IsOptional()
  @Allow()
  include?: Record<string, unknown>;

  @IsOptional()
  @Allow()
  select?: Record<string, unknown>;
}

export class CreateManyDto {
  @Allow()
  data!: Array<Record<string, unknown>>;

  @IsOptional()
  @Allow()
  skipDuplicates?: boolean;
}

export class UpdateOneDto {
  @Allow()
  data!: Record<string, unknown>;

  @IsOptional()
  @Allow()
  include?: Record<string, unknown>;

  @IsOptional()
  @Allow()
  select?: Record<string, unknown>;
}

export class UpdateManyDto {
  @IsOptional()
  @Allow()
  where?: Record<string, unknown>;

  @Allow()
  data!: Record<string, unknown>;
}

export class UpsertDto {
  @Allow()
  where!: Record<string, unknown>;

  @Allow()
  create!: Record<string, unknown>;

  @Allow()
  update!: Record<string, unknown>;

  @IsOptional()
  @Allow()
  include?: Record<string, unknown>;

  @IsOptional()
  @Allow()
  select?: Record<string, unknown>;
}

export class DeleteManyDto {
  @IsOptional()
  @Allow()
  where?: Record<string, unknown>;
}
