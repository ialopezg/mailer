import { Injectable, Logger } from '@nestjs/common';
import { CONFIRM_REGISTRATION, MAIL_QUEUE } from '../constants';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class MailService {
  private readonly _logger = new Logger(MailService.name);

  constructor(@InjectQueue(MAIL_QUEUE) private readonly _mailQueue: Queue) {}

  public async sendEmail(data: any): Promise<void> {
    switch (data.action) {
      case 'REGISTRATION':
      default:
        return this._sendConfirmationEmail(data);
    }
  }

  async _sendConfirmationEmail(
    data: Partial<{
      language: string;
      from: string;
      subject: string;
      emailAddress: string;
      context: Partial<{ siteTitle: string; confirmUrl: string }>;
    }>,
  ): Promise<void> {
    try {
      await this._mailQueue.add(CONFIRM_REGISTRATION, {
        language: data.language,
        from: data.from,
        subject: data.subject,
        emailAddress: data.emailAddress,
        context: data.context,
      });
    } catch (error) {
      this._logger.error(
        `Error queueing registration email to user ${data.emailAddress}`,
      );

      throw error;
    }
  }
}
