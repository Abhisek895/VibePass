import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuditService } from '../../modules/admin/intelligence/audit.service';

@Injectable()
export class AuditGuard implements CanActivate {
  constructor(private auditService: AuditService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Only super_admin requires an active audit session for sensitive data.
    // Others are restricted by RolesGuard anyway for these endpoints.
    if (user?.role !== 'super_admin') {
      return true;
    }

    const sessionId = request.headers['x-audit-session-id'];
    
    if (!sessionId) {
      throw new ForbiddenException('Missing x-audit-session-id header');
    }

    const isActive = await this.auditService.isSessionActive(sessionId as string);

    if (!isActive) {
      throw new ForbiddenException('Active audit session required for sensitive data access');
    }

    return true;
  }
}
