import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { hashPassword, verifyPassword } from '../../common/utils/crypto.util';
import { EmailService } from '../../services/email/email.service';
import { PrismaService } from '../../database/prisma.service';

type OtpContext = 'signup' | 'forgot-password' | 'forgot-username';
type SocialProvider = 'google' | 'facebook' | 'instagram';
type PendingOtpRecord = {
  expiresAt: number;
  otp: string;
  passwordHash?: string;
  username?: string;
};

type AuthUserRecord = {
  email: string;
  id: string;
  isBanned: boolean;
  isSuspended: boolean;
  username: string | null;
};

@Injectable()
export class AuthService {
  // Mock in-memory OTP store for MVP without Redis
  private otpStore = new Map<string, PendingOtpRecord>();

  constructor(
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  private buildAuthSuccessResponse(
    user: { id: string; email: string; username: string | null },
    accessToken: string,
    message: string,
    isNewUser: boolean,
    nickname?: string,
  ) {
    return {
      success: true,
      message,
      accessToken,
      isNewUser,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        nickname: nickname ?? user.username ?? 'VibeUser',
      },
    };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private normalizeUsername(username: string) {
    return username
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 32);
  }

  private assertUserCanAuthenticate(user: AuthUserRecord) {
    if (user.isBanned) {
      throw new ForbiddenException('This account has been banned.');
    }

    if (user.isSuspended) {
      throw new ForbiddenException('This account has been suspended.');
    }
  }

  private signAccessToken(user: { email: string; id: string; username: string | null }) {
    return this.jwtService.sign({
      email: user.email,
      sub: user.id,
      username: user.username,
    });
  }

  private async assertUsernameAvailable(username: string, excludeUserId?: string) {
    const normalizedUsername = this.normalizeUsername(username);

    if (!normalizedUsername) {
      throw new BadRequestException('Please choose a valid nickname.');
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        username: normalizedUsername,
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      },
      select: { id: true },
    });

    if (existingUser) {
      throw new BadRequestException('That nickname is already taken.');
    }

    return normalizedUsername;
  }

  private async generateUniqueUsername(baseValue: string) {
    const baseUsername = this.normalizeUsername(baseValue) || 'vibepass-user';
    let candidate = baseUsername;
    let suffix = 1;

    while (true) {
      const existingUser = await this.prisma.user.findFirst({
        where: { username: candidate },
        select: { id: true },
      });

      if (!existingUser) {
        return candidate;
      }

      suffix += 1;
      candidate = `${baseUsername.slice(0, Math.max(1, 28 - String(suffix).length))}-${suffix}`;
    }
  }

  private getHashedPassword(password: string) {
    return hashPassword(password);
  }

  private checkPassword(password: string, passwordHash: string) {
    return verifyPassword(password, passwordHash);
  }

  async requestOtp(
    email: string,
    context: OtpContext,
    username?: string,
    password?: string,
  ) {
    const normalizedEmail = this.normalizeEmail(email);
    const otp = this.generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now
    const otpRecord: PendingOtpRecord = { otp, expiresAt };

    if (context === 'signup') {
      const trimmedUsername = username?.trim();

      if (!trimmedUsername) {
        throw new BadRequestException('Nickname is required to create an account.');
      }

      if (!password || password.trim().length < 6) {
        throw new BadRequestException(
          'Password must be at least 6 characters long.',
        );
      }

      const existingUser = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        this.assertUserCanAuthenticate(existingUser);
      }

      if (existingUser?.passwordHash) {
        throw new BadRequestException('An account with this email already exists.');
      }

      const availableUsername = await this.assertUsernameAvailable(
        trimmedUsername,
        existingUser?.id,
      );

      otpRecord.username = availableUsername;
      otpRecord.passwordHash = hashPassword(password);

      if (!existingUser) {
        await this.prisma.user.create({
          data: {
            id: randomUUID(),
            email: normalizedEmail,
            username: availableUsername,
          },
        });
      } else if (existingUser.username !== availableUsername) {
        await this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            username: availableUsername,
          },
        });
      }
    }

    if (context !== 'signup') {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!existingUser) {
        throw new BadRequestException('User not found');
      }

      this.assertUserCanAuthenticate(existingUser);
    }

    // In a real app, this should be stored in Redis
    this.otpStore.set(`${context}_${normalizedEmail}`, otpRecord);

    const delivery = await this.emailService.sendOtpEmail(
      normalizedEmail,
      otp,
      context,
    );

    return {
      success: true,
      message: delivery.message,
      deliveryMode: delivery.mode,
      otpPreview: delivery.previewOtp,
    };
  }

  async verifyOtp(email: string, submittedOtp: string, context: OtpContext) {
    const normalizedEmail = this.normalizeEmail(email);
    const key = `${context}_${normalizedEmail}`;
    const record = this.otpStore.get(key);

    if (!record) {
      throw new BadRequestException('No pending OTP found for this email');
    }

    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(key);
      throw new BadRequestException('OTP has expired');
    }

    if (record.otp !== submittedOtp) {
      throw new BadRequestException('Invalid OTP');
    }

    // Success - clean up OTP
    this.otpStore.delete(key);

    if (context === 'signup') {
      if (!record.passwordHash) {
        throw new BadRequestException(
          'Signup details expired. Please request a new OTP.',
        );
      }

      const existingUser = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        this.assertUserCanAuthenticate(existingUser);
      }

      const isNewUser = !existingUser?.passwordHash;
      let user = existingUser;

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            id: randomUUID(),
            email: normalizedEmail,
            passwordHash: record.passwordHash,
            username: record.username,
          },
        });
      } else {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            passwordHash: record.passwordHash,
            username: record.username ?? user.username,
          },
        });
      }

      const accessToken = this.signAccessToken(user);

      return this.buildAuthSuccessResponse(
        user,
        accessToken,
        'Email verified successfully.',
        isNewUser,
      );
    } else {
      const user = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      this.assertUserCanAuthenticate(user);

      const accessToken = this.signAccessToken(user);

      return this.buildAuthSuccessResponse(
        user,
        accessToken,
        context === 'forgot-username'
          ? `Signed in successfully. Your username is ${user.username ?? normalizedEmail.split('@')[0]}.`
          : 'Email verified successfully.',
        false,
      );
    }
  }

  async login(email: string, pass: string) {
    if (!email || !pass) {
      throw new BadRequestException('Incorrect email or password');
    }

    const normalizedEmail = this.normalizeEmail(email);
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new BadRequestException('Incorrect email or password');
    }

    if (!user.passwordHash) {
      throw new BadRequestException(
        'This account is pending verification. Please complete OTP verification first.',
      );
    }

    this.assertUserCanAuthenticate(user);
    
    if (!verifyPassword(pass, user.passwordHash)) {
      throw new BadRequestException('Incorrect email or password');
    }

    const accessToken = this.signAccessToken(user);

    return this.buildAuthSuccessResponse(
      user,
      accessToken,
      'Logged in successfully.',
      false,
    );
  }

  async socialLogin(
    provider: SocialProvider,
    _email?: string,
    _displayName?: string,
    _providerUserId?: string,
  ) {
    const normalizedProvider = provider.toLowerCase() as SocialProvider;
    const providerLabel = this.formatProviderLabel(normalizedProvider);
    throw new NotImplementedException(
      `${providerLabel} sign-in is not configured on this backend.`,
    );
  }

  async logout() {
    return {
      success: true,
      message: 'Logged out successfully.',
    };
  }

  private formatProviderLabel(provider: SocialProvider) {
    switch (provider) {
      case 'google':
        return 'Google';
      case 'facebook':
        return 'Facebook';
      case 'instagram':
        return 'Instagram';
    }
  }
}
