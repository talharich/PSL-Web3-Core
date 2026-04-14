import * as crypto from 'crypto';

interface OtpRecord {
  code: string;
  expiresAt: number;
  attempts: number;
}

// Separate stores for signup vs login OTPs
const signupOtps = new Map<string, OtpRecord>();  // email → OTP
const loginOtps  = new Map<string, OtpRecord>();

const OTP_TTL_MS       = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS     = 5;
const OTP_LENGTH       = 6;

function generateCode(): string {
  // Cryptographically random 6-digit code
  return crypto.randomInt(100_000, 999_999).toString();
}

export const otpStore = {
  // ── Signup OTPs ────────────────────────────────────────────────────────
  createSignupOtp(email: string): string {
    const code = generateCode();
    signupOtps.set(email.toLowerCase(), {
      code,
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
    });
    return code;
  },

  verifySignupOtp(email: string, code: string): 'ok' | 'expired' | 'invalid' | 'max_attempts' {
    const record = signupOtps.get(email.toLowerCase());
    if (!record) return 'expired';
    if (Date.now() > record.expiresAt) {
      signupOtps.delete(email.toLowerCase());
      return 'expired';
    }
    if (record.attempts >= MAX_ATTEMPTS) return 'max_attempts';

    if (record.code !== code) {
      record.attempts++;
      return 'invalid';
    }

    signupOtps.delete(email.toLowerCase()); // one-time use
    return 'ok';
  },

  // ── Login OTPs (for 2FA if you want it) ──────────────────────────────
  createLoginOtp(email: string): string {
    const code = generateCode();
    loginOtps.set(email.toLowerCase(), {
      code,
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
    });
    return code;
  },

  verifyLoginOtp(email: string, code: string): 'ok' | 'expired' | 'invalid' | 'max_attempts' {
    const record = loginOtps.get(email.toLowerCase());
    if (!record) return 'expired';
    if (Date.now() > record.expiresAt) {
      loginOtps.delete(email.toLowerCase());
      return 'expired';
    }
    if (record.attempts >= MAX_ATTEMPTS) return 'max_attempts';

    if (record.code !== code) {
      record.attempts++;
      return 'invalid';
    }

    loginOtps.delete(email.toLowerCase());
    return 'ok';
  },

  hasPendingSignupOtp(email: string): boolean {
    const record = signupOtps.get(email.toLowerCase());
    return !!record && Date.now() < record.expiresAt;
  },
};