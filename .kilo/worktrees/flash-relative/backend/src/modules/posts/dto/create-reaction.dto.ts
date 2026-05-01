import { IsEnum } from 'class-validator';

export enum ReactionType {
  LIKE = 'like',
  LOVE = 'love',
  CARE = 'care',
  HAHA = 'haha',
  WOW = 'wow',
  SAD = 'sad',
  ANGRY = 'angry',
}

export class CreateReactionDto {
  @IsEnum(ReactionType)
  reactionType: ReactionType;
}
