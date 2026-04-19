import axios, { AxiosInstance } from 'axios';
import { EnvConfig } from '../config/env.config';
import { normalizeApiError } from './error-normalizer';
import { AppConfig } from '../../core/config/app.config';

const resolveToken = (): string | null => {
  const storage = AppConfig.auth.storageType === 'localStorage' ? localStorage : sessionStorage;
  return storage.getItem(AppConfig.auth.tokenKey);
};

export const httpClient: AxiosInstance = axios.create({
  baseURL: EnvConfig.apiBaseUrl,
  timeout: EnvConfig.requestTimeout,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use(
  (config) => {
    const token = resolveToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(normalizeApiError(error))
);

httpClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeApiError(error))
);
