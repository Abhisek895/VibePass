import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export enum RoleEnum {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum ReportActionEnum {
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
  ESCALATED = 'escalated',
}

export class UpdateUserRoleDto {
  @IsEnum(RoleEnum)
  @Type(() => String)
  role: RoleEnum;
}

export class BanUserDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class SuspendUserDto {
  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationHours?: number;
}

export class ResolveReportDto {
  @IsEnum(ReportActionEnum)
  action: ReportActionEnum;

  @IsOptional()
  @IsString()
  notes?: string;
}
