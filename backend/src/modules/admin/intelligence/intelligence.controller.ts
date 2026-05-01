import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { IntelligenceService } from './intelligence.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('api/v1/admin-panel/ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IntelligenceController {
  constructor(private readonly intelligenceService: IntelligenceService) {}

  @Post('analyze-user')
  @Roles('admin', 'super_admin')
  async analyzeUser(@Body('userId') userId: string) {
    return this.intelligenceService.analyzeUser(userId);
  }

  @Get('insights')
  @Roles('admin', 'super_admin')
  async getGlobalInsights() {
    return this.intelligenceService.getGlobalInsights();
  }
}
