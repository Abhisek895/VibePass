import { Controller, Get, Post, Body, Param, Query, UseGuards, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';
import { PostsService } from './posts.service';

@Controller('api/v1/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createPost(
    @User() user: { id: string },
    @Body() body: { content: string; imageUrl?: string; isDarkMeme?: boolean },
  ) {
    return this.postsService.createPost(user.id, body);
  }

  @Get('feed')
  getFeed(@Query('cursor') cursor?: string, @Query('limit') limit?: string) {
    return this.postsService.getFeed(cursor, limit ? parseInt(limit) : 20);
  }

  @Get(':postId')
  getPost(@Param('postId') postId: string) {
    return this.postsService.getPostById(postId);
  }

  @Post(':postId/like')
  @UseGuards(JwtAuthGuard)
  likePost(@User() user: { id: string }, @Param('postId') postId: string) {
    return this.postsService.likePost(user.id, postId);
  }

  @Get(':postId/liked')
  @UseGuards(JwtAuthGuard)
  checkLiked(@User() user: { id: string }, @Param('postId') postId: string) {
    return this.postsService.checkUserLiked(user.id, postId);
  }

  @Post(':postId/comments')
  @UseGuards(JwtAuthGuard)
  addComment(
    @User() user: { id: string },
    @Param('postId') postId: string,
    @Body() body: { content: string },
  ) {
    return this.postsService.addComment(user.id, postId, body.content);
  }

  @Get(':postId/comments')
  getComments(
    @Param('postId') postId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.postsService.getComments(postId, cursor, limit ? parseInt(limit) : 20);
  }

  @Post(':postId/share')
  @UseGuards(JwtAuthGuard)
  sharePost(@User() user: { id: string }, @Param('postId') postId: string) {
    return this.postsService.sharePost(user.id, postId);
  }

  @Get('user/:userId')
  getUserPosts(
    @Param('userId') userId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.postsService.getUserPosts(userId, cursor, limit ? parseInt(limit) : 20);
  }

  @Delete(':postId')
  @UseGuards(JwtAuthGuard)
  deletePost(@User() user: { id: string }, @Param('postId') postId: string) {
    return this.postsService.deletePost(user.id, postId);
  }
}