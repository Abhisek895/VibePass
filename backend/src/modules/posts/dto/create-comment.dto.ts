import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MaxLength(1000)
  content: string;

  @IsOptional()
  @IsString()
  parentCommentId?: string;
}
