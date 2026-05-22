import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { fail } from '../utils/api-response.util';
import { resolveExceptionResponse } from '../utils/http-exception-response.util';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const { status, message } = resolveExceptionResponse(exception);

    response.status(status).json(
      fail(message, {
        statusCode: status,
        path: request.url,
        timestamp: new Date().toISOString(),
      }),
    );
  }
}
