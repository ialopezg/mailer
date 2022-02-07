import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { CONFIRM_REGISTRATION, MAIL_QUEUE } from '../constants';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
@Processor(MAIL_QUEUE)
export class MailProcessor {
  private readonly _logger = new Logger(MailProcessor.name);

  constructor(
    private readonly _mailerService: MailerService,
    private readonly _configService: ConfigService,
  ) {}

  @OnQueueActive()
  public onActive(job: Job) {
    this._logger.debug(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  public onComplete(job: Job) {
    this._logger.debug(`Completed job ${job.id} of type ${job.name}`);
  }

  @OnQueueFailed()
  public onError(job: Job<any>, error: any) {
    this._logger.error(
      `Failed job ${job.id} of type ${job.name}: ${error.message}`,
      error.stack,
    );
  }

  @Process(CONFIRM_REGISTRATION)
  public async confirmRegistration(
    job: Job<{
      from: string;
      subject: string;
      language: string;
      emailAddress: string;
      context: Partial<{
        siteTitle: string;
        siteLogoUrl: string;
        confirmUrl: string;
        customerId: string;
        senderName: string;
        senderAddress: string;
        senderCity: string;
        senderState: string;
        senderCountry: string;
        postalCode: string;
        contactUrl: string;
        unsubcribeUrl: string;
        dashboardUrl: string;
        accountUrl: string;
        helpUrl: string;
      }>;
    }>,
  ) {
    this._logger.log(
      `Sending confirm registration email to '${job.data.emailAddress}'`,
    );
    const language =
      job.data.language && job.data.language !== 'en' ? job.data.language : '';
    const path = `../templates/registration${language}`;
    console.log(job.data, path);

    try {
      return this._mailerService.sendMail({
        to: job.data.emailAddress,
        from: job.data?.from || job.data.emailAddress,
        subject: job.data.subject
          ? job.data?.subject
          : this._configService.get(':: BOILERPLATE - CUENTA ACTIVADA ::'),
        template: path,
        context: {
          siteTitle: job.data.context?.siteTitle,
          siteUrl:
            'https://rfcsapi.com/' ?? this._configService.get('APP_SITE_URL'),
          siteLogoUrl:
            job.data.context?.siteLogoUrl ??
            this._configService.get('APP_SITE_LOGO_URL'),
          recipientName: '',
          confirmUrl: job.data.context?.confirmUrl,
          customerId: job.data.context?.customerId,
          senderName: job.data.context?.senderName,
          senderAddress: job.data.context?.senderAddress,
          senderCity: job.data.context?.senderCity,
          senderState: job.data.context?.senderState,
          senderCountry: job.data.context?.senderCountry,
          senderPostalCode: job.data.context?.postalCode,
          contactUrl: 'https://rfcsapi.com/contact',
          unsubscribeUrl: 'https://rfcsapi.com/unsubscribe',
          dashboardUrl: 'https://admin.rfcsapi.com',
          accountUrl: 'https://admin.rfcsapi.com/account',
          helpUrl: 'https://admin.rfcsapi.com/support',
        },
      });
    } catch {
      this._logger.error(
        `Failed to send confirmation email to '${job.data.emailAddress}'`,
      );
    }
  }
}
