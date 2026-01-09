import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { VerificationEmailJob } from './email.processor';


@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async addVerificationEmailJob(data: VerificationEmailJob): Promise<void> {
    this.logger.log(`Adding verification email job for: ${data.email}`);
    
    await this.emailQueue.add('verification', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
}
