import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app';

async function bootstrap(): Promise<void> {
  const configService = new ConfigService();
  console.log(configService);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: 4001,
      },
    } as TcpOptions,
  );

  await app.listenAsync();
}

void bootstrap();
