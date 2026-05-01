import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class MatchActionDto {
  @IsString()
  @IsIn(['like', 'pass'])
  action: 'like' | 'pass';

  @IsString()
  @IsNotEmpty()
  matchId: string;
}
