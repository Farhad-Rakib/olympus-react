const toBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
};

export const EnvConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  useMockApi: toBoolean(import.meta.env.VITE_USE_MOCK_API, true),
  requestTimeout: Number(import.meta.env.VITE_API_TIMEOUT_MS || 30000),
};
