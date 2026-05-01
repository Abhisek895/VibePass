import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';
import {
  BlockUserDto,
  ReportUserDto,
  SubmitFeedbackDto,
} from './dto/safety.dto';
import { SafetyService } from './safety.service';

@Controller('api/v1/safety')
@UseGuards(JwtAuthGuard)
export class SafetyController {
  constructor(private readonly safetyService: SafetyService) {}

  @Post('report')
  reportUser(@User() user: { id: string }, @Body() dto: ReportUserDto) {
    return this.safetyService.reportUser(user.id, dto);
  }

  @Post('block')
  blockUser(@User() user: { id: string }, @Body() dto: BlockUserDto) {
    return this.safetyService.blockUser(user.id, dto);
  }

  @Get('blocked-users')
  getBlockedUsers(@User() user: { id: string }) {
    return this.safetyService.getBlockedUsers(user.id);
  }

  @Post('feedback')
  submitFeedback(
    @User() user: { id: string },
    @Body() dto: SubmitFeedbackDto,
  ) {
    return this.safetyService.submitFeedback(user.id, dto);
  }
}
