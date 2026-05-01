import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuditService } from './audit.service';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('api/v1/admin-panel/audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post('start')
  @Roles('super_admin')
  async startSession(@Req() req: any, @Body() body: { userId: string; reason: string }) {
    return this.auditService.startSession(req.user.id, body.userId, body.reason);
  }

  @Post('end')
  @Roles('super_admin')
  async endSession(@Body('sessionId') sessionId: string) {
    return this.auditService.endSession(sessionId);
  }
}
