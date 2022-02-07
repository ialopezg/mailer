import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { MailService } from '../services';

@Controller()
export class MailController {
  constructor(private readonly _mailService: MailService) {}

  @EventPattern({ cmd: 'send-message' })
  async sendConfirmationEmail(@Payload() data: any): Promise<void> {
    await this._mailService.sendEmail(data);
  }
}
