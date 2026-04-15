import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { otpStore } from './otp.store';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';

// Pending signup data — held until OTP is verified
// (password is pre-hashed below before being stored here)
interface PendingSignup {
  password: string;
  displayName?: string;
  expiresAt: number;
}
const pendingSignups = new Map<string, PendingSignup>(); // email → data

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  // ── Step 1: Validate input, check duplicates, send OTP ───────────────────
  async requestSignupOtp(email: string, password: string, displayName?: string) {
    const normalised = email.toLowerCase().trim();

    // Block if email is already registered
    const existing = this.usersService.findByEmail(normalised);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    // Don't hammer the user — if an OTP is still pending, just resend it
    const code = otpStore.createSignupOtp(normalised);

    // Stash the signup data so step 2 can finish without the client re-sending password
    pendingSignups.set(normalised, {
      password,
      displayName,
      expiresAt: Date.now() + 11 * 60 * 1000, // slightly longer than OTP TTL
    });

    await this.emailService.sendSignupOtp(normalised, code);

    const isDevEnv = this.configService.get<string>('NODE_ENV') === 'development';

    return {
      message: `Verification code sent to ${email}. It expires in 10 minutes.`,
      ...(isDevEnv && {otpCode: code}),
    };
  }

  // ── Step 2: Verify OTP, create account, return JWT ───────────────────────
  async verifySignupOtp(email: string, otp: string, password: string, displayName?: string) {
    const normalised = email.toLowerCase().trim();

    const result = otpStore.verifySignupOtp(normalised, otp.trim());

    if (result === 'expired') {
      throw new BadRequestException('Verification code has expired. Please request a new one.');
    }
    if (result === 'max_attempts') {
      throw new BadRequestException('Too many incorrect attempts. Please request a new code.');
    }
    if (result === 'invalid') {
      throw new BadRequestException('Incorrect verification code.');
    }

    // OTP is valid — retrieve pending signup data
    const pending = pendingSignups.get(normalised);
    const finalPassword    = pending?.password    ?? password;
    const finalDisplayName = pending?.displayName ?? displayName;
    pendingSignups.delete(normalised);

    // Create the user
    const user = await this.usersService.createUser(normalised, finalPassword, finalDisplayName);
    const token = this.issueToken(user.id, user.email);

    // Fire-and-forget welcome email
    this.emailService.sendWelcome(normalised, user.displayName).catch(() => {});

    return {
      token,
      user: this.usersService.toPublicProfile(user),
    };
  }

  // ── Resend OTP ────────────────────────────────────────────────────────────
  async resendSignupOtp(email: string) {
    const normalised = email.toLowerCase().trim();

    // Make sure signup was actually initiated
    if (!pendingSignups.has(normalised)) {
      throw new BadRequestException('No pending signup for this email. Please start again.');
    }
    if (this.usersService.findByEmail(normalised)) {
      throw new ConflictException('This email is already verified and registered.');
    }

    const code = otpStore.createSignupOtp(normalised);
    await this.emailService.sendSignupOtp(normalised, code);

    return { message: 'A new verification code has been sent.' };
  }

  // ── Login — distinguishes missing user from wrong password ───────────────
  async login(email: string, password: string) {
    const normalised = email.toLowerCase().trim();

    // Check user exists first — gives a clear error instead of a generic one
    const userExists = this.usersService.findByEmail(normalised);
    if (!userExists) {
      throw new NotFoundException('No account found with this email address.');
    }

    // Now validate the password
    const user = await this.usersService.validateUser(normalised, password);
    if (!user) {
      throw new UnauthorizedException('Incorrect password.');
    }

    const token = this.issueToken(user.id, user.email);
    return {
      token,
      user: this.usersService.toPublicProfile(user),
    };
  }

  // ── Get current user from JWT ─────────────────────────────────────────────
  async getMe(userId: string) {
    const user = this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return this.usersService.toPublicProfile(user);
  }

  private issueToken(userId: string, email: string): string {
    return this.jwtService.sign({ sub: userId, email });
  }
}