import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { AppModule } from './app.module';
import { SwaggerConfig } from './common/configs/add-swagger.config';

const configService = new ConfigService();
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const sessionSecret = configService.getOrThrow('SECRET_KEY');

  if (!sessionSecret) {
    throw new Error('SECRET_KEY is not defined in environment variables');
  }

  app.use(
    session({
      secret: sessionSecret,
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 60000,
      },
    }),
  );

  app.use(cookieParser());

  SwaggerConfig.AddTo(app);

  await app.listen(configService.getOrThrow('PORT') ?? 3000, '0.0.0.0');

  console.log(`app running on : ${await app.getUrl()}`);
}
bootstrap();
