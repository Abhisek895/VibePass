import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';
import { MatchActionDto } from './dto/match-action.dto';
import { MatchesService } from './matches.service';

@Controller('api/v1/matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get('pool')
  getMatchPool(@User() user: { id: string }) {
    return this.matchesService.getMatchPool(user.id);
  }

  @Post('action')
  submitMatchAction(
    @User() user: { id: string },
    @Body() dto: MatchActionDto,
  ) {
    return this.matchesService.submitMatchAction(
      user.id,
      dto.action,
      dto.matchId,
    );
  }

  @Post('unmatch')
  unmatch(
    @User() user: { id: string },
    @Body('matchId') matchId: string,
  ) {
    return this.matchesService.unmatch(user.id, matchId);
  }
}
