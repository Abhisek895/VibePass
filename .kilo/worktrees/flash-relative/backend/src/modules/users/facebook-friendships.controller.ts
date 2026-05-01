import { Controller, Get, Param, Query, Post, Body, Delete, UseGuards, Request, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/friendships')
export class FacebookFriendshipsController {
  constructor(private prisma: PrismaService) {}

  /**
   * GET /api/friendships/:username/friends
   * Get user's friends list
   */
  @Get(':username/friends')
  async getUserFriends(
    @Param('username') username: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    try {
      const skip = (page - 1) * limit;

      // Get user ID
      const userResult: any = await this.prisma.$queryRawUnsafe(
        `SELECT id FROM facebook_clone.users WHERE username = '${username}' LIMIT 1`
      );

      if (!userResult || userResult.length === 0) {
        throw new NotFoundException(`User '${username}' not found`);
      }

      const userId = Array.isArray(userResult) ? userResult[0].id : userResult.id;

      // Get friendships
      const friendships: any = await this.prisma.$queryRawUnsafe(`
        SELECT DISTINCT CASE WHEN user_one_id = ${userId} THEN user_two_id ELSE user_one_id END as friend_id
        FROM facebook_clone.friendships
        WHERE user_one_id = ${userId} OR user_two_id = ${userId}
        LIMIT ${limit} OFFSET ${skip}
      `);

      const friendIds = (Array.isArray(friendships) ? friendships : [friendships]).map(f => f.friend_id);

      if (friendIds.length === 0) {
        return { friends: [], total: 0, page, pageSize: limit };
      }

      // Get friend details
      const friends: any = await this.prisma.$queryRawUnsafe(`
        SELECT u.id, u.username, u.first_name, u.last_name, 
               up.profile_photo_url, up.cover_photo_url, up.bio
        FROM facebook_clone.users u
        LEFT JOIN facebook_clone.user_profiles up ON u.id = up.user_id
        WHERE u.id IN (${friendIds.join(',')})
      `);

      // Get total count
      const totalResult: any = await this.prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as count FROM facebook_clone.friendships WHERE user_one_id = ${userId} OR user_two_id = ${userId}`
      );

      const total = Array.isArray(totalResult) ? totalResult[0].count : totalResult.count;

      return {
        friends: (Array.isArray(friends) ? friends : [friends]).map(f => ({
          id: f.id,
          username: f.username,
          firstName: f.first_name,
          lastName: f.last_name,
          profileImage: f.profile_photo_url,
          coverImage: f.cover_photo_url,
          bio: f.bio,
        })),
        total: Number(total),
        page,
        pageSize: limit,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching friends:', error);
      throw new NotFoundException('Failed to fetch friends');
    }
  }

  /**
   * GET /api/friendships/:username/requests
   * Get friend requests for a user
   */
  @Get(':username/requests')
  async getFriendRequests(
    @Param('username') username: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    try {
      const skip = (page - 1) * limit;

      // Get user ID
      const userResult: any = await this.prisma.$queryRawUnsafe(
        `SELECT id FROM facebook_clone.users WHERE username = '${username}' LIMIT 1`
      );

      if (!userResult || userResult.length === 0) {
        throw new NotFoundException(`User '${username}' not found`);
      }

      const userId = Array.isArray(userResult) ? userResult[0].id : userResult.id;

      // Get pending friend requests
      const requests: any = await this.prisma.$queryRawUnsafe(`
        SELECT fr.id, fr.sender_user_id, u.username, u.first_name, u.last_name,
               up.profile_photo_url, fr.created_at
        FROM facebook_clone.friend_requests fr
        JOIN facebook_clone.users u ON fr.sender_user_id = u.id
        LEFT JOIN facebook_clone.user_profiles up ON u.id = up.user_id
        WHERE fr.receiver_user_id = ${userId} AND fr.status = 'pending'
        ORDER BY fr.created_at DESC
        LIMIT ${limit} OFFSET ${skip}
      `);

      const total: any = await this.prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as count FROM facebook_clone.friend_requests WHERE receiver_user_id = ${userId} AND status = 'pending'`
      );

      const totalCount = Array.isArray(total) ? total[0].count : total.count;

      return {
        requests: (Array.isArray(requests) ? requests : [requests]).map(r => ({
          id: r.id,
          userId: r.sender_user_id,
          username: r.username,
          firstName: r.first_name,
          lastName: r.last_name,
          profileImage: r.profile_photo_url,
          sentAt: r.created_at,
        })),
        total: Number(totalCount),
        page,
        pageSize: limit,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching friend requests:', error);
      throw new NotFoundException('Failed to fetch friend requests');
    }
  }

  /**
   * POST /api/friendships/request
   * Send a friend request
   */
  @Post('request')
  @UseGuards(JwtAuthGuard)
  async sendFriendRequest(
    @Body() { targetUsername }: { targetUsername: string },
    @Request() req,
  ) {
    try {
      // Get target user
      const targetUser: any = await this.prisma.$queryRawUnsafe(
        `SELECT id FROM facebook_clone.users WHERE username = '${targetUsername}' LIMIT 1`
      );

      if (!targetUser || targetUser.length === 0) {
        throw new NotFoundException('User not found');
      }

      const targetUserId = Array.isArray(targetUser) ? targetUser[0].id : targetUser.id;

      // Create friend request
      const result = await this.prisma.$queryRawUnsafe(`
        INSERT INTO facebook_clone.friend_requests (sender_user_id, receiver_user_id, status)
        VALUES (${req.user.id}, ${targetUserId}, 'pending')
      `);

      return {
        message: 'Friend request sent',
        requestId: (result as any).insertId,
      };
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw new BadRequestException('Failed to send friend request');
    }
  }

  /**
   * POST /api/friendships/:requestId/accept
   * Accept a friend request
   */
  @Post(':requestId/accept')
  @UseGuards(JwtAuthGuard)
  async acceptFriendRequest(@Param('requestId') requestId: string, @Request() req) {
    try {
      // Get friend request
      const request: any = await this.prisma.$queryRawUnsafe(
        `SELECT sender_user_id FROM facebook_clone.friend_requests WHERE id = ${requestId} AND receiver_user_id = ${req.user.id} LIMIT 1`
      );

      if (!request || request.length === 0) {
        throw new NotFoundException('Friend request not found');
      }

      const senderUserId = Array.isArray(request) ? request[0].sender_user_id : request.sender_user_id;

      // Create friendship
      await this.prisma.$queryRawUnsafe(`
        INSERT INTO facebook_clone.friendships (user_one_id, user_two_id)
        VALUES (${Math.min(req.user.id, senderUserId)}, ${Math.max(req.user.id, senderUserId)})
      `);

      // Update request status
      await this.prisma.$queryRawUnsafe(
        `UPDATE facebook_clone.friend_requests SET status = 'accepted', responded_at = NOW() WHERE id = ${requestId}`
      );

      return { message: 'Friend request accepted' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error accepting friend request:', error);
      throw new BadRequestException('Failed to accept friend request');
    }
  }

  /**
   * DELETE /api/friendships/:requestId/reject
   * Reject a friend request
   */
  @Delete(':requestId/reject')
  @UseGuards(JwtAuthGuard)
  async rejectFriendRequest(@Param('requestId') requestId: string, @Request() req) {
    try {
      // Delete friend request
      await this.prisma.$queryRawUnsafe(
        `DELETE FROM facebook_clone.friend_requests WHERE id = ${requestId} AND receiver_user_id = ${req.user.id}`
      );

      return { message: 'Friend request rejected' };
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      throw new BadRequestException('Failed to reject friend request');
    }
  }

  /**
   * DELETE /api/friendships/remove/:username
   * Remove a friend
   */
  @Delete('remove/:username')
  @UseGuards(JwtAuthGuard)
  async removeFriend(@Param('username') username: string, @Request() req) {
    try {
      // Get friend user ID
      const friend: any = await this.prisma.$queryRawUnsafe(
        `SELECT id FROM facebook_clone.users WHERE username = '${username}' LIMIT 1`
      );

      if (!friend || friend.length === 0) {
        throw new NotFoundException('User not found');
      }

      const friendId = Array.isArray(friend) ? friend[0].id : friend.id;

      // Delete friendship
      await this.prisma.$queryRawUnsafe(`
        DELETE FROM facebook_clone.friendships 
        WHERE (user_one_id = ${req.user.id} AND user_two_id = ${friendId})
           OR (user_one_id = ${friendId} AND user_two_id = ${req.user.id})
      `);

      return { message: 'Friend removed' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error removing friend:', error);
      throw new BadRequestException('Failed to remove friend');
    }
  }
}
