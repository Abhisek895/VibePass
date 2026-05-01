import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateAuditLogDto {
  @IsString()
  action: string;

  @IsString()
  entityType: string;

  @IsString()
  entityId: string;

  @IsUUID()
  adminId: string;

  @IsOptional()
  @IsUUID()
  targetUserId?: string;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  metadata?: any;

  @IsOptional()
  isSensitive?: boolean;
}
