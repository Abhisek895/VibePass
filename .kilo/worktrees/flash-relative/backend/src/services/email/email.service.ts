import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

type OtpContext = 'signup' | 'forgot-password' | 'forgot-username';
type OtpDeliveryMode = 'smtp' | 'console';

export interface OtpDeliveryResult {
  mode: OtpDeliveryMode;
  message: string;
  previewOtp?: string;
}

@Injectable()
export class EmailService {
  private transporter?: nodemailer.Transporter;
  private readonly emailMode: 'console' | 'smtp';
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const configuredMode =
      this.configService.get<'console' | 'smtp'>('EMAIL_MODE');
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    const smtpUser =
      this.normalizeConfigValue(this.configService.get<string>('SMTP_USER')) ||
      this.normalizeConfigValue(this.configService.get<string>('FROM_EMAIL'));
    const smtpPass = this.normalizeSecret(
      this.configService.get<string>('SMTP_PASS'),
    );
    const smtpHost = this.normalizeConfigValue(
      this.configService.get<string>('SMTP_HOST'),
    );
    const smtpPort = this.parseNumber(
      this.configService.get<string>('SMTP_PORT'),
    );
    const smtpSecure = this.parseBoolean(
      this.configService.get<string>('SMTP_SECURE'),
    );
    const smtpService =
      this.normalizeConfigValue(this.configService.get<string>('SMTP_SERVICE')) ||
      (smtpUser?.toLowerCase().includes('gmail.com') ? 'gmail' : undefined);

    let resolvedMode = configuredMode ?? (nodeEnv === 'production' ? 'smtp' : 'console');

    this.fromEmail =
      this.normalizeConfigValue(this.configService.get<string>('FROM_EMAIL')) ||
      'no-reply@vibepass.app';
    this.fromName =
      this.normalizeConfigValue(this.configService.get<string>('SMTP_FROM_NAME')) ||
      'VibePass Safety';

    if (resolvedMode === 'smtp') {
      const transportConfig = this.buildTransportConfig({
        smtpHost,
        smtpPass,
        smtpPort,
        smtpSecure,
        smtpService,
        smtpUser,
      });

      if (transportConfig) {
        this.transporter = nodemailer.createTransport(transportConfig);
      } else if (nodeEnv !== 'production') {
        resolvedMode = 'console';
        this.logger.warn(
          'EMAIL_MODE is set to smtp, but SMTP config is incomplete. Falling back to console delivery in development.',
        );
      } else {
        this.logger.warn(
          'EMAIL_MODE is set to smtp, but SMTP config is incomplete. Email delivery will fail until SMTP credentials are configured.',
        );
      }
    }

    this.emailMode = resolvedMode;
  }

  async sendOtpEmail(
    to: string,
    otp: string,
    context: OtpContext,
  ): Promise<OtpDeliveryResult> {
    let subject = '';
    let text = '';

    switch (context) {
      case 'signup':
        subject = 'Welcome to VibePass - Your Verification Code';
        text = `Your verification code to create an account is: ${otp}\n\nThis code will expire in 10 minutes.`;
        break;
      case 'forgot-password':
        subject = 'VibePass - Password Reset Request';
        text = `Your password reset code is: ${otp}\n\nIf you did not request this, please ignore this email.`;
        break;
      case 'forgot-username':
        subject = 'VibePass - Username Recovery';
        text = `Your verification code to recover your username is: ${otp}\n\nIf you did not request this, please ignore this email.`;
        break;
    }

    if (this.emailMode === 'console') {
      this.logger.log(`[EMAIL_MODE=console] OTP for ${to} (${context}): ${otp}`);
      return {
        mode: 'console',
        message:
          'OTP generated in development mode. Use the code shown in the app or backend logs.',
        previewOtp: otp,
      };
    }

    if (!this.transporter) {
      throw new Error(
        'SMTP delivery is enabled, but the SMTP connection is not configured.',
      );
    }

    try {
      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to,
        subject,
        text,
      });
      this.logger.log(`OTP email sent to ${to} for context: ${context}`);
      return {
        mode: 'smtp',
        message: `OTP sent to ${to}. Please check your inbox and spam folder.`,
      };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);

      if (this.configService.get<string>('NODE_ENV') !== 'production') {
        this.logger.warn(
          'SMTP failed in development. Falling back to console OTP delivery.',
        );
        this.logger.log(`[EMAIL_MODE=console] OTP for ${to} (${context}): ${otp}`);
        return {
          mode: 'console',
          message:
            'SMTP delivery failed in development, so the OTP is shown directly in the app.',
          previewOtp: otp,
        };
      }

      throw new Error('Failed to send verification email');
    }
  }

  private buildTransportConfig({
    smtpHost,
    smtpPass,
    smtpPort,
    smtpSecure,
    smtpService,
    smtpUser,
  }: {
    smtpHost?: string;
    smtpPass?: string;
    smtpPort?: number;
    smtpSecure?: boolean;
    smtpService?: string;
    smtpUser?: string;
  }) {
    const auth =
      smtpUser && smtpPass
        ? {
            user: smtpUser,
            pass: smtpPass,
          }
        : undefined;

    if (smtpService) {
      return {
        service: smtpService,
        ...(auth ? { auth } : {}),
      };
    }

    if (!smtpHost) {
      return undefined;
    }

    const resolvedSecure =
      smtpSecure ?? (smtpPort !== undefined ? smtpPort === 465 : false);

    return {
      host: smtpHost,
      port: smtpPort ?? (resolvedSecure ? 465 : 587),
      secure: resolvedSecure,
      ...(auth ? { auth } : {}),
    };
  }

  private normalizeConfigValue(value?: string) {
    return value?.trim() || undefined;
  }

  private normalizeSecret(value?: string) {
    return value?.replace(/\s+/g, '') || undefined;
  }

  private parseBoolean(value?: string) {
    if (!value) {
      return undefined;
    }

    if (value.toLowerCase() === 'true') {
      return true;
    }

    if (value.toLowerCase() === 'false') {
      return false;
    }

    return undefined;
  }

  private parseNumber(value?: string) {
    if (!value) {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
}
