import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IsEmail, IsString, IsOptional, MinLength, IsNumber, IsNotEmpty, IsNumberString, Length } from 'class-validator';

// ── DTOs ──────────────────────────────────────────────────────────────────────

class RequestSignupOtpDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

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

  @IsString()
  @MinLength(10, { message: 'Password must be at least 10 characters' })
  password: string;

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
  @MinLength(10, { message: 'Password must be at least 10 characters' })
  password: string;
}

// ── Controller ────────────────────────────────────────────────────────────────

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ── Step 1 of signup: validate email, send OTP ────────────────────────────
  // POST /api/auth/signup/request-otp
  // Body: { email, password, displayName? }
  // Returns: { message }
  @Post('signup/request-otp')
  async requestSignupOtp(@Body() dto: RequestSignupOtpDto) {
    if (!dto.email || !dto.password) {
      throw new BadRequestException('Email and password are required');
    }
    if (dto.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
    return this.authService.requestSignupOtp(dto.email, dto.password, dto.displayName);
  }

  // ── Step 2 of signup: submit OTP, create account ──────────────────────────
  // POST /api/auth/signup/verify-otp
  // Body: { email, otp, password, displayName? }
  // Returns: { token, user }
  @Post('signup/verify-otp')
  async verifySignupOtp(@Body() dto: VerifySignupOtpDto) {
    if (!dto.email || !dto.otp) {
      throw new BadRequestException('Email and OTP are required');
    }
    return this.authService.verifySignupOtp(dto.email, dto.otp, dto.password, dto.displayName);
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  // POST /api/auth/login
  // Body: { email, password }
  // Returns: { token, user }
  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    if (!dto.email || !dto.password) {
      throw new BadRequestException('Email and password are required');
    }
    return this.authService.login(dto.email, dto.password);
  }

  // ── Resend OTP ────────────────────────────────────────────────────────────
  // POST /api/auth/signup/resend-otp
  // Body: { email }
  @Post('signup/resend-otp')
  @HttpCode(200)
  async resendOtp(@Body() body: { email: string }) {
    if (!body.email) throw new BadRequestException('Email is required');
    return this.authService.resendSignupOtp(body.email);
  }

  // ── Get current user ──────────────────────────────────────────────────────
  // GET /api/auth/me
  // Header: Authorization: Bearer <token>
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req) {
    return this.authService.getMe(req.user.userId);
  }
}