import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IsEmail, IsString, IsOptional, MinLength, IsNotEmpty, IsNumberString, Length } from 'class-validator';

// ── DTOs ──────────────────────────────────────────────────────────────────────

class RequestSignupOtpDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(10, { message: 'Password must be at least 10 characters' })
  password: string;

  @IsOptional()
  @IsString()
  displayName?: string;
}

class VerifySignupOtpDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @IsNotEmpty({ message: 'OTP cannot be empty' })
  @IsString({ message: 'OTP must be a string' })
  @IsNumberString({}, { message: 'OTP must contain only numeric digits' })
  @Length(6, 6, { message: 'OTP must be exactly 6 digits long' })
  otp: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  displayName?: string;
}

class LoginDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password: string;
}

// ── Controller ────────────────────────────────────────────────────────────────

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /api/auth/signup/request-otp
  @Post('signup/request-otp')
  async requestSignupOtp(@Body() dto: RequestSignupOtpDto) {
    return this.authService.requestSignupOtp(dto.email, dto.password, dto.displayName);
  }

  // POST /api/auth/signup/verify-otp
  @Post('signup/verify-otp')
  async verifySignupOtp(@Body() dto: VerifySignupOtpDto) {
    return this.authService.verifySignupOtp(dto.email, dto.otp, dto.password, dto.displayName);
  }

  // POST /api/auth/login
  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  // POST /api/auth/signup/resend-otp
  @Post('signup/resend-otp')
  @HttpCode(200)
  async resendOtp(@Body() body: { email: string }) {
    if (!body.email) throw new BadRequestException('Email is required');
    return this.authService.resendSignupOtp(body.email);
  }

  // GET /api/auth/me
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req) {
    return this.authService.getMe(req.user.userId);
  }
}