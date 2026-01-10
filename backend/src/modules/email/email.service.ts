import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface VerificationEmailData {
  email: string;
  name: string;
  verificationToken: string;
  createdAt?: Date;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST', 'smtp.mailtrap.io'),
      port: this.configService.get<number>('MAIL_PORT', 587),
      secure: this.configService.get<string>('MAIL_SECURE', 'false') === 'true',
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get<string>('MAIL_FROM', 'noreply@example.com'),
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      throw error;
    }
  }

  private formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('id-ID', options);
  }

  private getHtmlTemplate(title: string, content: string, themeColor: string = '#22c55e'): string {
    const appName = this.configService.get<string>('APP_NAME', 'NestReact App');
    const supportEmail = this.configService.get<string>('SUPPORT_EMAIL', 'support@example.com');
    const currentYear = new Date().getFullYear();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="background-color: ${themeColor}; padding: 32px 40px; text-align: center;">
                    <span style="color: #ffffff; font-size: 20px; font-weight: 600;">${appName}</span>
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 40px;">
                    ${content}
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #fafafa; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 8px; color: #9ca3af; font-size: 13px; line-height: 1.5;">
                      E-mail ini dibuat secara otomatis, mohon tidak membalas.
                    </p>
                    <p style="margin: 0 0 16px; color: #9ca3af; font-size: 13px; line-height: 1.5;">
                      Jika butuh bantuan, silakan <a href="mailto:${supportEmail}" style="color: ${themeColor}; text-decoration: none; font-weight: 500;">hubungi kami</a>.
                    </p>
                    <p style="margin: 0; color: #d1d5db; font-size: 12px;">
                      © ${currentYear} ${appName}. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  async sendVerificationEmail(email: string, name: string, verificationToken: string, createdAt?: Date, temporaryPassword?: string): Promise<boolean> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:8080');
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
    const registrationDate = createdAt ? this.formatDate(createdAt) : this.formatDate(new Date());

    const content = `
      <!-- Greeting -->
      <p style="margin: 0 0 8px; color: #6b7280; font-size: 15px;">
        Hai <strong style="color: #374151;">${name}</strong>,
      </p>
      
      <!-- Title -->
      <h1 style="margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 700; line-height: 1.3;">
        Verifikasi Alamat Email Anda
      </h1>
      
      <!-- Description -->
      <p style="margin: 0 0 32px; color: #6b7280; font-size: 15px; line-height: 1.6;">
        Akun Anda telah berhasil dibuat. Silakan klik tombol di bawah untuk memverifikasi alamat email Anda dan mengaktifkan akun.
      </p>
      
      <!-- Account Info Box -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 32px;">
        <tr>
          <td style="padding: 20px;">
            <p style="margin: 0 0 16px; color: #22c55e; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
              INFORMASI AKUN
            </p>
            
            <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom: 1px solid #f3f4f6;">
              <tr>
                <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Nama</td>
                <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500; text-align: right;">${name}</td>
              </tr>
            </table>
            
            <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom: 1px solid #f3f4f6;">
              <tr>
                <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Email</td>
                <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500; text-align: right;">${email}</td>
              </tr>
            </table>

            ${temporaryPassword ? `
            <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom: 1px solid #f3f4f6;">
              <tr>
                <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Password Sementara</td>
                <td style="padding: 12px 0; color: #ef4444; font-size: 14px; font-weight: 600; text-align: right;">${temporaryPassword}</td>
              </tr>
            </table>
            ` : ''}
            
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Tanggal Registrasi</td>
                <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500; text-align: right;">${registrationDate}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      ${temporaryPassword ? `
      <p style="margin: 0 0 32px; color: #ef4444; font-size: 13px; line-height: 1.6; text-align: center; font-style: italic;">
        *Disarankan untuk segera mengubah password Anda setelah login pertama kali.
      </p>
      ` : ''}
      
      <!-- Expiry Notice -->
      <p style="margin: 0 0 20px; color: #9ca3af; font-size: 13px; text-align: center;">
        Link verifikasi ini akan kadaluarsa dalam 60 menit.
      </p>
      
      <!-- Button -->
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <a href="${verificationLink}" style="display: inline-block; background-color: #22c55e; color: #ffffff; text-decoration: none; padding: 14px 48px; border-radius: 8px; font-size: 15px; font-weight: 600; box-shadow: 0 2px 4px rgba(34, 197, 94, 0.3);">
              Verifikasi Email
            </a>
          </td>
        </tr>
      </table>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verifikasi Alamat Email Anda',
      html: this.getHtmlTemplate('Verifikasi Email', content, '#22c55e'),
    });
  }

  async sendResetPasswordEmail(email: string, name: string, resetToken: string): Promise<boolean> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:8080');
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    const content = `
      <!-- Greeting -->
      <p style="margin: 0 0 8px; color: #6b7280; font-size: 15px;">
        Hai <strong style="color: #374151;">${name}</strong>,
      </p>
      
      <!-- Title -->
      <h1 style="margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 700; line-height: 1.3;">
        Permintaan Reset Password
      </h1>
      
      <!-- Description -->
      <p style="margin: 0 0 32px; color: #6b7280; font-size: 15px; line-height: 1.6;">
        Kami menerima permintaan untuk mereset password akun Anda. Silakan klik tombol di bawah untuk memilih password baru.
      </p>
      
      <!-- Button -->
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding: 0 0 32px;">
            <a href="${resetLink}" style="display: inline-block; background-color: #f97316; color: #ffffff; text-decoration: none; padding: 14px 48px; border-radius: 8px; font-size: 15px; font-weight: 600; box-shadow: 0 2px 4px rgba(249, 115, 22, 0.3);">
              Reset Password
            </a>
          </td>
        </tr>
      </table>

      <!-- Expiry Notice -->
      <p style="margin: 0 0 20px; color: #9ca3af; font-size: 13px; text-align: center; line-height: 1.5;">
        Link reset password ini akan kadaluarsa dalam 60 menit.<br>
        Abaikan email ini jika Anda tidak merasa melakukan permintaan ini.
      </p>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Reset Password Akun Anda',
      html: this.getHtmlTemplate('Reset Password', content, '#f97316'),
    });
  }
}
