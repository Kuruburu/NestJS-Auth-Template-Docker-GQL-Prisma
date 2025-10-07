import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import type { CorsConfig, NestConfig, SwaggerConfig } from './common/configs/config.interface';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';
import { LoginInput } from './auth/dto/login.input';
import { SignupInput } from './auth/dto/signup.input';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validation
  app.useGlobalPipes(new ValidationPipe());

  // enable shutdown hook
  app.enableShutdownHooks();

  // Prisma Client Exception Filter for unhandled exceptions
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const configService = app.get(ConfigService);
  const nestConfig = configService.get<NestConfig>('nest');
  const corsConfig = configService.get<CorsConfig>('cors');
  const swaggerConfig = configService.get<SwaggerConfig>('swagger');

  // Swagger Api
  if (swaggerConfig && swaggerConfig.enabled) {
    const options = new DocumentBuilder()
      .setTitle(swaggerConfig.title)
      .setDescription(swaggerConfig.description)
      .setVersion(swaggerConfig.version)
      .addBearerAuth(swaggerConfig.bearerAuth.options, swaggerConfig.bearerAuth.name)
      .addSecurityRequirements(swaggerConfig.bearerAuth.name)
      .build();
    const document = SwaggerModule.createDocument(app, options, {
      deepScanRoutes: true,
      extraModels: [LoginInput, SignupInput],
    });

    SwaggerModule.setup(swaggerConfig.path, app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  // Cors
  if (corsConfig && corsConfig.enabled) {
    app.enableCors();
  }

  await app.listen((nestConfig && nestConfig.port) || 3000);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
