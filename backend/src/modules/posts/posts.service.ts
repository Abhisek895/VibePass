import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  private async resolveUserId(userIdentifier: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: userIdentifier }, { username: userIdentifier }],
      },
      select: { id: true },
    });

    return user?.id ?? userIdentifier;
  }

  async createPost(userId: string, data: { content: string; imageUrl?: string; isDarkMeme?: boolean }) {
    return this.prisma.post.create({
      data: {
        userId,
        content: data.content,
        imageUrl: data.imageUrl || null,
        isDarkMeme: data.isDarkMeme || false,
      },
      include: {
        user: {
          include: { profile: true },
        },
        likes: true,
        comments: {
          include: {
            user: {
              include: { profile: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
    });
  }

  async getFeed(cursor?: string, limit = 20) {
    const posts = await this.prisma.post.findMany({
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          include: { profile: true },
        },
        likes: true,
        comments: {
          include: {
            user: {
              include: { profile: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
    });

    const hasMore = posts.length > limit;
    const result = hasMore ? posts.slice(0, -1) : posts;
    const nextCursor = hasMore ? result[result.length - 1]?.id : null;

    return { posts: result, nextCursor };
  }

  async getPostById(postId: string) {
    return this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          include: { profile: true },
        },
        likes: true,
        comments: {
          include: {
            user: {
              include: { profile: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async likePost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingLike = await this.prisma.postLike.findUnique({
      where: {
        postId_userId: { postId, userId },
      },
    });

    if (existingLike) {
      await this.prisma.postLike.delete({
        where: { id: existingLike.id },
      });
      await this.prisma.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
      });
      return { liked: false };
    }

    await this.prisma.postLike.create({
      data: { postId, userId },
    });
    await this.prisma.post.update({
      where: { id: postId },
      data: { likesCount: { increment: 1 } },
    });

    if (post.userId !== userId) {
      await this.notificationsService.createNotification({
        userId: post.userId,
        actorId: userId,
        type: 'LIKE_POST',
        targetId: postId,
        targetType: 'post',
        data: {
          actionUrl: `/feed?post=${postId}`,
          postId,
        },
      });
    }

    return { liked: true };
  }

  async checkUserLiked(userId: string, postId: string) {
    const like = await this.prisma.postLike.findUnique({
      where: {
        postId_userId: { postId, userId },
      },
    });
    return !!like;
  }

  async addComment(userId: string, postId: string, content: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = await this.prisma.postComment.create({
      data: {
        postId,
        userId,
        content,
      },
      include: {
        user: {
          include: { profile: true },
        },
      },
    });
    await this.prisma.post.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } },
    });

    if (post.userId !== userId) {
      await this.notificationsService.createNotification({
        userId: post.userId,
        actorId: userId,
        type: 'COMMENT_POST',
        targetId: postId,
        targetType: 'post',
        data: {
          actionUrl: `/feed?post=${postId}`,
          commentId: comment.id,
          postId,
        },
      });
    }

    return comment;
  }

  async getComments(postId: string, cursor?: string, limit = 20) {
    const comments = await this.prisma.postComment.findMany({
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      where: { postId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          include: { profile: true },
        },
      },
    });

    const hasMore = comments.length > limit;
    const result = hasMore ? comments.slice(0, -1) : comments;
    const nextCursor = hasMore ? result[result.length - 1]?.id : null;

    return { comments: result, nextCursor };
  }

  async sharePost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.prisma.postShare.create({
      data: {
        originalPostId: postId,
        sharedByUserId: userId,
      },
    });
    await this.prisma.post.update({
      where: { id: postId },
      data: { sharesCount: { increment: 1 } },
    });

    if (post.userId !== userId) {
      await this.notificationsService.createNotification({
        userId: post.userId,
        actorId: userId,
        type: 'SHARE_POST',
        targetId: postId,
        targetType: 'post',
        data: {
          actionUrl: `/feed?post=${postId}`,
          postId,
        },
      });
    }

    return { shared: true };
  }

  async getUserPosts(userId: string, cursor?: string, limit = 20) {
    const resolvedUserId = await this.resolveUserId(userId);

    const posts = await this.prisma.post.findMany({
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      where: { userId: resolvedUserId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          include: { profile: true },
        },
        likes: true,
        comments: {
          include: {
            user: {
              include: { profile: true },
            },
          },
          take: 3,
        },
      },
    });

    const hasMore = posts.length > limit;
    const result = hasMore ? posts.slice(0, -1) : posts;
    const nextCursor = hasMore ? result[result.length - 1]?.id : null;

    return { posts: result, nextCursor };
  }

  async deletePost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.userId !== userId) {
      throw new Error('Not authorized to delete this post');
    }

    await this.prisma.post.delete({
      where: { id: postId },
    });
    return { deleted: true };
  }
}
