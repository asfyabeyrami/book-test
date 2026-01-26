import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

interface ErrorResponse {
  success: boolean;
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HTTP');

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const responseBody = this.getErrorResponse(exception, request);

    if (responseBody.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logError(exception, request);
    }

    httpAdapter.reply(response, responseBody, responseBody.statusCode);
  }

  private getErrorResponse(exception: any, request: any): ErrorResponse {
    return (
      this.handleHttpException(exception, request) ||
      this.handleUnhandledError(request, exception)
    );
  }

  private handleHttpException(
    exception: any,
    request: any,
  ): ErrorResponse | undefined {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const response = exception.getResponse();

      const message =
        typeof response === 'object'
          ? response['message'] || response['error']
          : response;

      return {
        success: false,
        statusCode,
        message: message || 'req faild',
        timestamp: new Date().toISOString(),
        path: request.url,
      };
    }
    return undefined;
  }

  private handleUnhandledError(request: any, exception: any): ErrorResponse {
    return {
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'internal server error',
      timestamp: new Date().toISOString(),
      path: request.url,
    };
  }

  private logError(exception: any, request: any) {
    this.logger.error(exception.message, {
      stack: exception.stack,
      url: request.url,
      method: request.method,
      body: request.body,
    });
  }
}
