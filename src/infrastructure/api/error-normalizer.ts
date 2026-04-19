import axios from 'axios';
import { ApiError } from '../../domain/types/api-error.type';

export const normalizeApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as { message?: string; code?: string } | undefined;

    return {
      message: responseData?.message || error.message || 'Unexpected API error',
      statusCode: error.response?.status,
      code: responseData?.code,
      details: error.response?.data,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: 'Unexpected error occurred',
    details: error,
  };
};
