import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

import { MAIL_QUEUE } from './constants';
import { MailController } from './controllers';
import { MailProcessor } from './processors';
import { MailService } from './services';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('EMAIL_HOST'),
          port: +configService.get('EMAIL_PORT'),
          secure: configService.get<boolean>('EMAIL_SECURE'),
          auth: {
            user: configService.get('EMAIL_ADDRESS'),
            pass: configService.get('EMAIL_PASSWORD'),
          },
          tls: { rejectUnauthorized: false },
        },
        defaults: { from: configService.get<string>('EMAIL_FROM') },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(undefined, {
            inlineCssEnabled: false,
          }),
          options: { strict: true },
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: MAIL_QUEUE }),
  ],
  controllers: [MailController],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}
