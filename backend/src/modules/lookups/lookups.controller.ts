import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LookupsService } from './lookups.service';

@Controller('api/v1/lookups')
@UseGuards(JwtAuthGuard)
export class LookupsController {
  constructor(private readonly lookupsService: LookupsService) {}

  @Get('onboarding')
  getOnboardingLookups() {
    return this.lookupsService.getOnboardingLookups();
  }

  @Get('moods')
  getMoods() {
    return this.lookupsService.getMoods();
  }
}
