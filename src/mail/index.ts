import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

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
          dir: __dirname + '/templates',
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
        signOptions: {
          expiresIn: `${configService.get(
            'JWT_VERIFICATION_TOKEN_EXPIRATION_TIME',
          )}s`,
        },
      }),
    }),
    BullModule.registerQueue({ name: MAIL_QUEUE }),
  ],
  controllers: [MailController],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}
