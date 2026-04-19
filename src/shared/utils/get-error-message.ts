import { ApiError } from '../../domain/types/api-error.type';

export const getErrorMessage = (error: unknown, fallback: string): string => {
  const apiError = error as ApiError;
  return apiError?.message || fallback;
};
