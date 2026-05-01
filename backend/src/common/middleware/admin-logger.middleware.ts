import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminLoggerMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const admin = (req as any).user;
    if (!admin || !['admin', 'super_admin'].includes(admin.role)) {
      return next();
    }

    const originalSend = res.send;
    res.send = (body: any) => {
      // After response is sent, we log if it was successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        this.logAction(req, admin).catch(err => console.error('Admin Log Error:', err));
      }
      return originalSend.call(res, body);
    };

    next();
  }

  private async logAction(req: Request, admin: any) {
    const action = this.mapRouteToAction(req.method, req.path);
    if (!action) return;

    const targetUserId = req.params.userId || req.body.userId || req.params.id;
    const sessionId = req.headers['x-audit-session-id'] as string;

    const isSensitive = [
      'VIEW_CHAT',
      'VIEW_DELETED_MESSAGES',
      'AI_ANALYSIS_VIEW'
    ].includes(action);

    await this.prisma.auditLog.create({
      data: {
        action,
        entityType: this.getEntityType(req.path),
        entityId: targetUserId || 'system',
        adminId: admin.id,
        targetUserId: targetUserId || null,
        sessionId: sessionId || null,
        isSensitive: isSensitive,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: {
          method: req.method,
          path: req.path,
          query: req.query,
          body: this.sanitizeBody(req.body)
        }
      }
    });
  }

  private mapRouteToAction(method: string, path: string): string | null {
    if (path.includes('/admin/users') && method === 'GET') return 'USER_VIEW';
    if (path.includes('/ban') && method === 'POST') return 'USER_BAN';
    if (path.includes('/suspend') && method === 'POST') return 'USER_SUSPEND';
    if (path.includes('/reports') && method === 'PUT') return 'REPORT_REVIEW';
    if (path.includes('/chats') && method === 'GET') return 'VIEW_CHAT';
    if (path.includes('/messages/deleted') && method === 'GET') return 'VIEW_DELETED_MESSAGES';
    if (path.includes('/admin/ai/analyze') && method === 'POST') return 'AI_ANALYSIS_VIEW';
    if (path.includes('/admin/audit/start') && method === 'POST') return 'AUDIT_MODE_START';
    if (path.includes('/admin/audit/end') && method === 'POST') return 'AUDIT_MODE_END';
    return null;
  }

  private getEntityType(path: string): string {
    if (path.includes('/users')) return 'USER';
    if (path.includes('/reports')) return 'REPORT';
    if (path.includes('/chats')) return 'CHAT';
    if (path.includes('/ai')) return 'AI_INSIGHT';
    return 'SYSTEM';
  }

  private sanitizeBody(body: any) {
    const sanitized = { ...body };
    delete sanitized.password;
    delete sanitized.token;
    return sanitized;
  }
}
