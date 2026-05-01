import { IsArray, IsBoolean, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class FindManyNotificationsDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === true || value === 'true') {
      return true;
    }

    if (value === false || value === 'false') {
      return false;
    }

    return undefined;
  })
  unread?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.filter(Boolean);
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
    }

    return undefined;
  })
  types?: string[];

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  @Transform(({ value }) => Math.min(value, 50))
  limit?: number = 20;
}

