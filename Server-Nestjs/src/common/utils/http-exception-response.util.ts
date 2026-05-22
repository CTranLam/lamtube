import { HttpException, HttpStatus } from '@nestjs/common';

const DEFAULT_ERROR_MESSAGE = 'Internal server error';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const normalizeMessage = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const message = value.trim();
    return message || null;
  }

  if (Array.isArray(value)) {
    const message = value
      .filter((item) => typeof item === 'string')
      .join(', ')
      .trim();
    return message || null;
  }

  return null;
};

export const resolveExceptionResponse = (exception: unknown) => {
  if (!(exception instanceof HttpException)) {
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: DEFAULT_ERROR_MESSAGE,
    };
  }

  const exceptionResponse = exception.getResponse();
  let message = normalizeMessage(exceptionResponse);

  if (!message && isRecord(exceptionResponse)) {
    message = normalizeMessage(exceptionResponse.message);
  }

  return {
    status: exception.getStatus(),
    message: message ?? DEFAULT_ERROR_MESSAGE,
  };
};
