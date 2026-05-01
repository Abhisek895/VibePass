import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';
import { MatchesService } from './matches.service';

@Controller('api/v1/connections')
@UseGuards(JwtAuthGuard)
export class ConnectionsController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  getConnections(@User() user: { id: string }) {
    return this.matchesService.getConnections(user.id);
  }
}
