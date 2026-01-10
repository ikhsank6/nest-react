import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { EmailService } from '../email/email.service';


export interface VerificationEmailJob {
  email: string;
  name: string;
  verificationToken: string;
  createdAt?: string;
  temporaryPassword?: string;
}

export interface ResetPasswordEmailJob {
  email: string;
  name: string;
  resetToken: string;
}

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {}

  @Process('verification')
  async handleVerificationEmail(job: Job<VerificationEmailJob>) {
    this.logger.log(`Processing verification email job for: ${job.data.email}`);
    
    try {
      const createdAt = job.data.createdAt ? new Date(job.data.createdAt) : undefined;
      await this.emailService.sendVerificationEmail(
        job.data.email,
        job.data.name,
        job.data.verificationToken,
        createdAt,
        job.data.temporaryPassword,
      );
      this.logger.log(`Verification email sent successfully to: ${job.data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to: ${job.data.email}`, error);
      throw error;
    }
  }

  @Process('resetPassword')
  async handleResetPasswordEmail(job: Job<ResetPasswordEmailJob>) {
    this.logger.log(`Processing reset password email job for: ${job.data.email}`);
    
    try {
      await this.emailService.sendResetPasswordEmail(
        job.data.email,
        job.data.name,
        job.data.resetToken,
      );
      this.logger.log(`Reset password email sent successfully to: ${job.data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send reset password email to: ${job.data.email}`, error);
      throw error;
    }
  }
}

