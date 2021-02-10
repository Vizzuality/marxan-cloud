import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import * as config from 'config';

/**
 * Catch-all exception filter.
 *
 *
 */
@Catch(Error)
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    Logger.error(`Error: ${JSON.stringify(exception, null, 2)}`);

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // In development environments only, add full error details to the response.
    const errorDetails =
      config.util.getEnv('NODE_ENV') === 'development'
        ? {
            type: Object.getPrototypeOf(exception)?.name,
            raw: exception,
            stack: exception.stack,
          }
        : undefined;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: {
        message: exception.message,
        ...errorDetails,
      },
    });
  }
}
