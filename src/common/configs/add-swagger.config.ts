import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export class SwaggerConfig {
  public static AddTo(app: INestApplication<any>) {
    const config = new DocumentBuilder()
      .setTitle('Books Service')
      .setDescription('API documentation for the Books Service.')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);

    // Get the underlying HTTP adapter
    const httpAdapter = app.getHttpAdapter();

    // Apply the Public decorator to Swagger routes
    const originalRouteHandler = httpAdapter.get;
    httpAdapter.get = function (path, ...args) {
      if (
        path === '/api' ||
        path === '/api-json' ||
        path.startsWith('/swagger-ui')
      ) {
        // Apply Public decorator to Swagger routes
        const routeHandler = args[args.length - 1];
        args[args.length - 1] = function (req, res, next) {
          req.isPublic = true;
          return routeHandler(req, res, next);
        };
      }
      return originalRouteHandler.call(this, path, ...args);
    };

    SwaggerModule.setup('api', app, document, {
      jsonDocumentUrl: '/swagger-json',
      swaggerOptions: {
        persistAuthorization: true,
      },
    }); // Swagger UI at /api
  }
}
