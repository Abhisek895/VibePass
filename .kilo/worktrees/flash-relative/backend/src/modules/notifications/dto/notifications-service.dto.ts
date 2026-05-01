import { IsOptional, IsBoolean, IsString, IsInt, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class NotificationsServiceDto {
  @IsOptional()
  @IsBoolean()
  unread?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  types?: string[];

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

