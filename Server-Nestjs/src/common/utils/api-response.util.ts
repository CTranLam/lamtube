import { ApiResponse } from '../types/api-response.type';
export const ok = <T>(data: T, message = 'Success'): ApiResponse<T> => {
  return {
    success: true,
    message,
    data,
  };
};
export const fail = <T>(message: string, data: T): ApiResponse<T> => {
  return {
    success: false,
    message,
    data,
  };
};
