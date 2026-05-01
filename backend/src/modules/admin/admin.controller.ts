import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from '../../common/decorators/user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuditGuard } from '../../common/guards/audit.guard';
import {
  BanUserDto,
  ResolveReportDto,
  SuspendUserDto,
  UpdateUserRoleDto,
} from './dto/admin.dto';
import { AdminService } from './admin.service';

@Controller('api/v1/admin-panel')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @Roles('admin', 'super_admin')
  async getUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.adminService.getAllUsers(search, role, limit, offset);
  }

  @Get('users/:id')
  @Roles('admin', 'super_admin')
  async getUser(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Put('users/:id/ban')
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.OK)
  async banUser(@User() user: any, @Param('id') userId: string, @Body() dto: BanUserDto) {
    return this.adminService.banUser(user.id, userId, dto.reason);
  }

  @Put('users/:id/unban')
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.OK)
  async unbanUser(@User() user: any, @Param('id') userId: string, @Body() dto: BanUserDto) {
    return this.adminService.unbanUser(user.id, userId, dto.reason);
  }

  @Put('users/:id/suspend')
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.OK)
  async suspendUser(@User() user: any, @Param('id') userId: string, @Body() dto: SuspendUserDto) {
    return this.adminService.suspendUser(user.id, userId, dto);
  }

  @Put('users/:id/unsuspend')
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.OK)
  async unsuspendUser(@User() user: any, @Param('id') userId: string, @Body() dto: BanUserDto) {
    return this.adminService.unsuspendUser(user.id, userId, dto.reason);
  }

  @Put('users/:id/role')
  @Roles('super_admin')
  @HttpCode(HttpStatus.OK)
  async changeUserRole(
    @User() user: any,
    @Param('id') userId: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    const targetUser = await this.adminService.getUserById(userId);
    if (targetUser.role === 'super_admin') {
      throw new ConflictException('Cannot modify super_admin');
    }

    return this.adminService.changeUserRole(user.id, userId, dto.role);
  }

  @Delete('users/:id')
  @Roles('super_admin')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@User() user: any, @Param('id') userId: string) {
    const targetUser = await this.adminService.getUserById(userId);
    if (targetUser.role === 'super_admin') {
      throw new ConflictException('Cannot delete super_admin');
    }
    return this.adminService.deleteUser(user.id, userId);
  }

  @Get('users/:id/detail')
  @Roles('admin', 'super_admin')
  async getUserDetail(@Param('id') id: string) {
    return this.adminService.getUserDetail(id);
  }

  @Get('reports')
  @Roles('moderator', 'admin', 'super_admin')
  async getReports(
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.adminService.getAllReports(status, limit, offset);
  }

  @Put('reports/:id/resolve')
  @Roles('moderator', 'admin', 'super_admin')
  @HttpCode(HttpStatus.OK)
  async resolveReport(
    @User() user: any,
    @Param('id') reportId: string,
    @Body() dto: ResolveReportDto,
  ) {
    return this.adminService.resolveReport(user.id, reportId, dto.action, dto.notes);
  }

  @Get('analytics')
  @Roles('admin', 'super_admin')
  async getAnalytics() {
    return this.adminService.getAnalytics();
  }

  @Get('audit-logs')
  @Roles('super_admin')
  async getAuditLogs(
    @Query('action') action?: string,
    @Query('adminId') adminId?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.adminService.getAuditLogs(limit, offset, action, adminId);
  }

  // ── CONTENT MODERATION ──

  @Get('content/posts')
  @Roles('moderator', 'admin', 'super_admin')
  async getAllPosts(
    @Query('search') search?: string,
    @Query('darkMeme') darkMeme?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const isDarkMeme = darkMeme === 'true' ? true : darkMeme === 'false' ? false : undefined;
    return this.adminService.getAllPosts(search, isDarkMeme, limit, offset);
  }

  @Delete('content/posts/:id')
  @Roles('moderator', 'admin', 'super_admin')
  @HttpCode(HttpStatus.OK)
  async deletePost(
    @User() user: any,
    @Param('id') postId: string,
    @Body() body: { reason?: string },
  ) {
    return this.adminService.adminDeletePost(user.id, postId, body?.reason);
  }

  // ── SUPER ADMIN: FULL USER DATA ACCESS ──

  @Get('users/:id/chats')
  @Roles('super_admin')
  @UseGuards(AuditGuard)
  async getUserChats(
    @Param('id') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.adminService.getUserChats(userId, limit, offset);
  }

  @Get('chats/:chatId/messages')
  @Roles('super_admin')
  @UseGuards(AuditGuard)
  async getChatMessages(
    @User() admin: any,
    @Param('chatId') chatId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.adminService.getChatMessages(admin.id, chatId, limit, offset);
  }

  @Get('users/:id/relationships')
  @Roles('super_admin')
  @UseGuards(AuditGuard)
  async getUserRelationships(@Param('id') userId: string) {
    return this.adminService.getUserRelationships(userId);
  }

  @Get('users/:id/match-requests')
  @Roles('super_admin')
  @UseGuards(AuditGuard)
  async getUserMatchRequests(@Param('id') userId: string) {
    return this.adminService.getUserMatchRequests(userId);
  }

  @Get('messages/all')
  @Roles('super_admin')
  @UseGuards(AuditGuard)
  async getAllMessages(
    @Query('search') search?: string,
    @Query('senderId') senderId?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.adminService.getAllMessages(search, senderId, limit, offset);
  }

  // ── SUPER ADMIN: BLOCKS ──

  @Get('users/:id/blocks')
  @Roles('super_admin')
  @UseGuards(AuditGuard)
  async getUserBlocks(@Param('id') userId: string) {
    return this.adminService.getUserBlocks(userId);
  }

  // ── SUPER ADMIN: VOICE SESSIONS ──

  @Get('users/:id/voice-sessions')
  @Roles('super_admin')
  @UseGuards(AuditGuard)
  async getUserVoiceSessions(@Param('id') userId: string) {
    return this.adminService.getUserVoiceSessions(userId);
  }

  @Get('voice-sessions/all')
  @Roles('super_admin')
  async getAllVoiceSessions(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.adminService.getAllVoiceSessions(limit, offset);
  }

  // ── SUPER ADMIN: NOTIFICATIONS ──

  @Get('users/:id/notifications')
  @Roles('super_admin')
  async getUserNotifications(
    @Param('id') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.adminService.getUserNotifications(userId, limit, offset);
  }

  // ── SUPER ADMIN: BADGES ──

  @Get('users/:id/badges')
  @Roles('super_admin')
  async getUserBadges(@Param('id') userId: string) {
    return this.adminService.getUserBadges(userId);
  }

  // ── SUPER ADMIN: USER FEEDBACK ──

  @Get('users/:id/feedback')
  @Roles('super_admin')
  async getUserFeedback(@Param('id') userId: string) {
    return this.adminService.getUserFeedback(userId);
  }

  // ── SUPER ADMIN: EVERYTHING (consolidated) ──

  @Get('users/:id/everything')
  @Roles('super_admin')
  @UseGuards(AuditGuard)
  async getUserEverything(@Param('id') userId: string) {
    return this.adminService.getUserEverything(userId);
  }
}
