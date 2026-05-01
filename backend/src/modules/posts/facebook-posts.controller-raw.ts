import { Controller, Get, Param, Query, Post, Body, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/posts')
export class FacebookPostsController {
  constructor(private prisma: PrismaService) {}

  /**
   * GET /api/posts/user/:username
   * Get all posts by a specific user
   */
  @Get('user/:username')
  async getUserPosts(
    @Param('username') username: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    try {
      // Get user ID
      const userResult: any = await this.prisma.$queryRawUnsafe(
        `SELECT id FROM facebook_clone.users WHERE username = '${username}' LIMIT 1`
      );

      if (!userResult || userResult.length === 0) {
        throw new NotFoundException(`User with username "${username}" not found`);
      }

      const userId = Array.isArray(userResult) ? userResult[0].id : userResult.id;

      // Get user's posts
      const posts: any = await this.prisma.$queryRawUnsafe(`
        SELECT p.id, p.content, p.privacy, p.background_color, p.created_at, p.updated_at,
               p.reactions_count, p.comments_count,
               u.id as user_id, u.username, u.first_name, u.last_name,
               up.profile_photo_url, pm.media_url
        FROM facebook_clone.posts p
        JOIN facebook_clone.users u ON p.author_id = u.id
        LEFT JOIN facebook_clone.user_profiles up ON u.id = up.user_id
        LEFT JOIN facebook_clone.post_media pm ON p.id = pm.post_id
        WHERE p.author_id = ${userId} AND p.status = 'active'
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${skip}
      `);

      const total: any = await this.prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as count FROM facebook_clone.posts WHERE author_id = ${userId} AND status = 'active'`
      );

      const totalCount = Array.isArray(total) ? total[0].count : total.count;

      return {
        posts: (Array.isArray(posts) ? posts : [posts]).map(post => ({
          id: post.id,
          userId: post.user_id,
          content: post.content,
          imageUrl: post.media_url,
          privacy: post.privacy,
          backgroundColor: post.background_color,
          user: {
            id: post.user_id,
            username: post.username,
            firstName: post.first_name,
            lastName: post.last_name,
            profileImage: post.profile_photo_url,
          },
          reactions: [],
          comments: [],
          commentsCount: post.comments_count,
          reactionsCount: post.reactions_count,
          createdAt: post.created_at,
          updatedAt: post.updated_at,
        })),
        total: Number(totalCount),
        page,
        pageSize: limit,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching user posts:', error);
      throw new NotFoundException('Failed to fetch posts');
    }
  }

  /**
   * GET /api/posts/:id
   * Get a single post with all details
   */
  @Get(':id')
  async getPost(@Param('id') postId: string) {
    try {
      const post: any = await this.prisma.$queryRawUnsafe(`
        SELECT p.id, p.content, p.privacy, p.background_color, p.created_at, p.updated_at,
               p.reactions_count, p.comments_count,
               u.id as user_id, u.username, u.first_name, u.last_name,
               up.profile_photo_url, pm.media_url
        FROM facebook_clone.posts p
        JOIN facebook_clone.users u ON p.author_id = u.id
        LEFT JOIN facebook_clone.user_profiles up ON u.id = up.user_id
        LEFT JOIN facebook_clone.post_media pm ON p.id = pm.post_id
        WHERE p.id = ${postId}
        LIMIT 1
      `);

      if (!post || post.length === 0) {
        throw new NotFoundException('Post not found');
      }

      const postRecord = Array.isArray(post) ? post[0] : post;

      return {
        id: postRecord.id,
        userId: postRecord.user_id,
        content: postRecord.content,
        imageUrl: postRecord.media_url,
        privacy: postRecord.privacy,
        backgroundColor: postRecord.background_color,
        user: {
          id: postRecord.user_id,
          username: postRecord.username,
          firstName: postRecord.first_name,
          lastName: postRecord.last_name,
          profileImage: postRecord.profile_photo_url,
        },
        reactions: [],
        comments: [],
        commentsCount: postRecord.comments_count,
        reactionsCount: postRecord.reactions_count,
        createdAt: postRecord.created_at,
        updatedAt: postRecord.updated_at,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching post:', error);
      throw new NotFoundException('Failed to fetch post');
    }
  }

  /**
   * POST /api/posts/:postId/comments
   * Add a comment to a post
   */
  @Post(':postId/comments')
  @UseGuards(JwtAuthGuard)
  async addComment(
    @Param('postId') postId: string,
    @Body() { content, parentCommentId }: { content: string; parentCommentId?: string },
    @Request() req,
  ) {
    try {
      const parentCommentIdVal = parentCommentId ? parseInt(parentCommentId) : null;

      const result: any = await this.prisma.$queryRawUnsafe(`
        INSERT INTO facebook_clone.comments (post_id, author_id, content, parent_comment_id, status)
        VALUES (${postId}, ${req.user.id}, '${content}', ${parentCommentIdVal || null}, 'active')
      `);

      return {
        id: result.insertId,
        postId: postId,
        userId: req.user.id,
        content: content,
        user: {
          id: req.user.id,
          username: req.user.username,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new NotFoundException('Failed to add comment');
    }
  }

  /**
   * GET /api/posts/:postId/comments
   * Get comments on a post
   */
  @Get(':postId/comments')
  async getPostComments(
    @Param('postId') postId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    try {
      const comments: any = await this.prisma.$queryRawUnsafe(`
        SELECT c.id, c.content, c.created_at, c.updated_at,
               u.id as user_id, u.username, u.first_name, u.last_name
        FROM facebook_clone.comments c
        JOIN facebook_clone.users u ON c.author_id = u.id
        WHERE c.post_id = ${postId} AND c.status = 'active' AND c.parent_comment_id IS NULL
        ORDER BY c.created_at DESC
        LIMIT ${limit} OFFSET ${skip}
      `);

      const total: any = await this.prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as count FROM facebook_clone.comments WHERE post_id = ${postId} AND status = 'active' AND parent_comment_id IS NULL`
      );

      const totalCount = Array.isArray(total) ? total[0].count : total.count;

      return {
        comments: (Array.isArray(comments) ? comments : [comments]).map(c => ({
          id: c.id,
          postId: postId,
          userId: c.user_id,
          content: c.content,
          user: {
            id: c.user_id,
            username: c.username,
            firstName: c.first_name,
            lastName: c.last_name,
          },
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        })),
        total: Number(totalCount),
        page,
        pageSize: limit,
      };
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw new NotFoundException('Failed to fetch comments');
    }
  }

  /**
   * POST /api/posts/:postId/reactions
   * Add a reaction to a post
   */
  @Post(':postId/reactions')
  @UseGuards(JwtAuthGuard)
  async addReaction(
    @Param('postId') postId: string,
    @Body() { reactionType }: { reactionType: string },
    @Request() req,
  ) {
    try {
      // Check if user already reacted
      const existing: any = await this.prisma.$queryRawUnsafe(
        `SELECT id FROM facebook_clone.reactions WHERE post_id = ${postId} AND user_id = ${req.user.id} LIMIT 1`
      );

      if (existing && existing.length > 0) {
        // Update reaction
        await this.prisma.$queryRawUnsafe(
          `UPDATE facebook_clone.reactions SET reaction_type = '${reactionType}' WHERE post_id = ${postId} AND user_id = ${req.user.id}`
        );
        return {
          id: existing[0].id,
          postId: postId,
          userId: req.user.id,
          reactionType: reactionType,
          createdAt: new Date(),
        };
      }

      // Create new reaction
      const result: any = await this.prisma.$queryRawUnsafe(`
        INSERT INTO facebook_clone.reactions (post_id, user_id, reaction_type)
        VALUES (${postId}, ${req.user.id}, '${reactionType}')
      `);

      return {
        id: result.insertId,
        postId: postId,
        userId: req.user.id,
        reactionType: reactionType,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw new NotFoundException('Failed to add reaction');
    }
  }

  /**
   * GET /api/posts/:postId/reactions
   * Get all reactions on a post
   */
  @Get(':postId/reactions')
  async getPostReactions(@Param('postId') postId: string) {
    try {
      const reactions: any = await this.prisma.$queryRawUnsafe(`
        SELECT r.id, r.reaction_type, r.created_at,
               u.id as user_id, u.username, u.first_name, u.last_name
        FROM facebook_clone.reactions r
        JOIN facebook_clone.users u ON r.user_id = u.id
        WHERE r.post_id = ${postId}
      `);

      const reactionList = Array.isArray(reactions) ? reactions : [reactions];

      // Group by type
      const byType = {
        like: 0,
        love: 0,
        care: 0,
        haha: 0,
        wow: 0,
        sad: 0,
        angry: 0,
      };

      reactionList.forEach(r => {
        if (r.reaction_type in byType) {
          byType[r.reaction_type]++;
        }
      });

      return {
        total: reactionList.length,
        byType,
        reactions: reactionList.map(r => ({
          id: r.id,
          postId: postId,
          userId: r.user_id,
          reactionType: r.reaction_type,
          user: {
            id: r.user_id,
            username: r.username,
            firstName: r.first_name,
            lastName: r.last_name,
          },
          createdAt: r.created_at,
        })),
      };
    } catch (error) {
      console.error('Error fetching reactions:', error);
      throw new NotFoundException('Failed to fetch reactions');
    }
  }
}
