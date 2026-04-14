import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host:   this.config.get<string>('email.host'),
      port:   this.config.get<number>('email.port'),
      secure: this.config.get<boolean>('email.secure'),
      auth: {
        user: this.config.get<string>('email.user'),
        pass: this.config.get<string>('email.pass'),
      },
    });
  }

  async sendSignupOtp(to: string, code: string): Promise<void> {
    await this.send({
      to,
      subject: 'Your PSL Moments verification code',
      html: this.otpTemplate({
        headline: 'Verify your email',
        body:     'Use the code below to complete your registration. It expires in 10 minutes.',
        code,
      }),
    });
  }

  async sendLoginOtp(to: string, code: string): Promise<void> {
    await this.send({
      to,
      subject: 'Your PSL Moments sign-in code',
      html: this.otpTemplate({
        headline: 'Sign-in verification',
        body:     'Use the code below to sign in. It expires in 10 minutes.',
        code,
      }),
    });
  }

  async sendWelcome(to: string, displayName: string): Promise<void> {
    await this.send({
      to,
      subject: 'Welcome to PSL Dynamic Moments',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;color:#1a1a1a">
          <h2 style="margin:0 0 16px">Welcome, ${displayName}!</h2>
          <p style="margin:0 0 12px;line-height:1.6">
            Your account is verified. You can now collect dynamic PSL NFTs that evolve
            as your favourite players perform.
          </p>
          <p style="margin:0;color:#666;font-size:13px">
            No wallet setup required. No gas fees. Just cricket.
          </p>
        </div>
      `,
    });
  }

  private async send(opts: { to: string; subject: string; html: string }): Promise<void> {
    const from = this.config.get<string>('email.from');
    try {
      await this.transporter.sendMail({ from, ...opts });
      this.logger.log(`Email sent → ${opts.to}: ${opts.subject}`);
    } catch (err) {
      // Don't throw — a failed email should never crash the signup flow.
      // Log it so you can debug SMTP config, but let the caller continue.
      this.logger.error(`Failed to send email to ${opts.to}: ${err.message}`);
    }
  }

  private otpTemplate(opts: { headline: string; body: string; code: string }): string {
    return `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;color:#1a1a1a">
        <h2 style="margin:0 0 8px">${opts.headline}</h2>
        <p style="margin:0 0 28px;line-height:1.6;color:#444">${opts.body}</p>
        <div style="
          background:#f4f4f4;
          border-radius:12px;
          padding:24px;
          text-align:center;
          letter-spacing:10px;
          font-size:32px;
          font-weight:700;
          color:#111;
          margin-bottom:24px;
        ">${opts.code}</div>
        <p style="margin:0;color:#999;font-size:12px">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `;
  }
}