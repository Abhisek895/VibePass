import { IsOptional, IsString, IsInt, IsArray, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PromptAnswerDto {
  @IsString()
  promptId: string;

  @IsString()
  answer: string;
}

export class OnboardUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsInt()
  age?: number;

  @IsOptional()
  @IsString()
  pronouns?: string;

  @IsOptional()
  @IsString()
  genderPreference?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  voiceComfort?: string;

  @IsOptional()
  @IsString()
  conversationIntent?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PromptAnswerDto)
  promptAnswers?: PromptAnswerDto[];
}