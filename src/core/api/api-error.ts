import axios from 'axios';

/**
 * Error envelope returned by the API's GlobalExceptionHandler.
 * `errors.fields` is only present for validation failures (HTTP 400).
 */
export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: {
    errors?: string[];
    fields?: Record<string, string[]>;
    exception?: string;
  };
}

const getApiError = (error: unknown): ApiErrorResponse | undefined => {
  if (axios.isAxiosError(error)) {
    return error.response?.data as ApiErrorResponse | undefined;
  }
  return undefined;
};

/** HTTP status of a failed request, or undefined for network/non-HTTP errors. */
export const getErrorStatus = (error: unknown): number | undefined =>
  axios.isAxiosError(error) ? error.response?.status : undefined;

/** User-facing message for any error thrown by an API call. */
export const getErrorMessage = (error: unknown, fallback = 'Something went wrong'): string => {
  const apiError = getApiError(error);
  if (apiError?.message) return apiError.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

/** Validation messages keyed by camelCase field name, e.g. `{ email: ['Email is required'] }`. */
export const getFieldErrors = (error: unknown): Record<string, string[]> =>
  getApiError(error)?.errors?.fields ?? {};
