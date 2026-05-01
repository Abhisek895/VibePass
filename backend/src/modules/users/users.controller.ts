import { Controller, Delete, Get, Put, Post, Body, Param, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { OnboardUserDto } from './dto/onboard-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ── Auth-guarded /me routes MUST come before parameterized routes ──
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@User() user: any) {
    return this.usersService.findById(user.id);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@User() user: any, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.id, dto);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async deleteMe(@User() user: any) {
    return this.usersService.deleteAccount(user.id);
  }

  @Post('me/profile-photo/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './public/uploads/profiles',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `profile-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  }))
  async uploadProfilePhoto(@User() user: any, @UploadedFile() file: any) {
    const url = `/public/uploads/profiles/${file.filename}`;
    return this.usersService.updateProfilePhoto(user.id, url);
  }

  @Delete('me/profile-photo')
  @UseGuards(JwtAuthGuard)
  async clearProfilePhoto(@User() user: any) {
    return this.usersService.updateProfilePhoto(user.id, null);
  }

  @Post('me/cover-photo/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './public/uploads/covers',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `cover-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  }))
  async uploadCoverPhoto(@User() user: any, @UploadedFile() file: any) {
    const url = `/public/uploads/covers/${file.filename}`;
    return this.usersService.updateCoverPhoto(user.id, url);
  }

  @Delete('me/cover-photo')
  @UseGuards(JwtAuthGuard)
  async clearCoverPhoto(@User() user: any) {
    return this.usersService.updateCoverPhoto(user.id, null);
  }

  // ── Non-auth routes ──
  @Post('onboard')
  @UseGuards(JwtAuthGuard)
  async onboard(@User() user: any, @Body() dto: OnboardUserDto) {
    return this.usersService.onboard(user.id, dto);
  }

  // ── Parameterized routes MUST come last ──
  @Get(':username')
  async getUserByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }

  @Get(':id/badges')
  async getBadges(@Param('id') id: string) {
    return this.usersService.getBadges(id);
  }
}

