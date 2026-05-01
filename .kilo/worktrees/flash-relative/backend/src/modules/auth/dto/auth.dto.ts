import {
  IsEmail,
  IsString,
  IsNotEmpty,
  Length,
  IsIn,
  IsOptional,
} from 'class-validator';

export class RequestOtpDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  password?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['signup', 'forgot-password', 'forgot-username'])
  context: 'signup' | 'forgot-password' | 'forgot-username';
}

export class VerifyOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 characters' })
  otp: string;
  
  @IsString()
  @IsNotEmpty()
  @IsIn(['signup', 'forgot-password', 'forgot-username'])
  context: 'signup' | 'forgot-password' | 'forgot-username';
}

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class SocialLoginDto {
  @IsString()
  @IsIn(['google', 'facebook', 'instagram'])
  provider: 'google' | 'facebook' | 'instagram';

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  displayName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  providerUserId?: string;
}
