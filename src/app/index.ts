import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { MailModule } from 'src/mail';

@Module({
  imports: [
    MailModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('QUEUE_HOST'),
          port: +configService.get<number>('QUEUE_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        EMAIL_HOST: Joi.string().required(),
        EMAIL_SECURE: Joi.boolean().required(),
        EMAIL_PORT: Joi.number().required(),
        EMAIL_ADDRESS: Joi.string().required(),
        EMAIL_PASSWORD: Joi.string().required(),
        EMAIL_CONFIRMATION_URL: Joi.string().required(),
        QUEUE_HOST: Joi.string().required(),
        QUEUE_PORT: Joi.number().required(),
        JWT_VERIFICATION_TOKEN_SECRET: Joi.string().required(),
        JWT_VERIFICATION_TOKEN_EXPIRATION_TIME: Joi.number().required(),
      }),
    }),
  ],
})
export class AppModule {}
