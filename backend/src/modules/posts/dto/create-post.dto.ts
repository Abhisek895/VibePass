import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';

export enum PostPrivacy {
  PUBLIC = 'public',
  FRIENDS = 'friends',
  PRIVATE = 'private',
}

export class CreatePostDto {
  @IsString()
  @MaxLength(5000)
  content: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsEnum(PostPrivacy)
  privacy?: PostPrivacy = PostPrivacy.PUBLIC;

  @IsOptional()
  @IsString()
  backgroundColor?: string;
}
