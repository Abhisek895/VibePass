import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReportUserDto {
  @IsString()
  @IsNotEmpty()
  reportedId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsOptional()
  @IsString()
  chatId?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class BlockUserDto {
  @IsString()
  @IsNotEmpty()
  blockedId: string;
}

export class SubmitFeedbackDto {
  @IsString()
  @IsNotEmpty()
  toUserId: string;

  @IsString()
  @IsNotEmpty()
  chatId: string;

  @IsArray()
  @IsString({ each: true })
  attributes: string[];
}
