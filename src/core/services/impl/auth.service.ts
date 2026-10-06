import { BaseRepository } from '../../api/base.repository';
import { LoginRequestDto, LoginResponseDto, RefreshTokenResponseDto, RegisterRequestDto, RegisterResponseDto, ApiResponse } from '../../../domain/dto/auth.dto';
import { IAuthService } from '../auth.service.interface';
import { AppConfig } from '../../config/app.config';
import {
  ExternalProviderDto,
  ExternalProviderStatusDto,
  GetExternalProviderStatusesApiResponse,
  GetExternalProvidersApiResponse,
} from '../../../domain/dto/external-auth.dto';

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ChangePasswordRequestDto {
  userId: number;
  currentPassword: string;
  newPassword: string;
}

export class AuthService extends BaseRepository implements IAuthService {
  constructor() {
    super('/Auth');
  }

  async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
    const response = await this.post<ApiResponse<LoginResponseDto>>('/login', dto);
    if (!response.success) {
      throw new Error(response.message || 'Login failed');
    }
    return response.data;
  }

  async register(dto: RegisterRequestDto): Promise<RegisterResponseDto> {
    const response = await this.post<ApiResponse<RegisterResponseDto>>('/register', dto);
    if (!response.success) {
      throw new Error(response.message || 'Registration failed');
    }
    return response.data;
  }

  async logout(refreshToken?: string | null): Promise<void> {
    // Revoke the refresh token server-side so it cannot be reused after logout.
    if (!refreshToken) return;
    await this.post('/revoke-refresh', { refreshToken });
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponseDto> {
    const response = await this.post<ApiResponse<RefreshTokenResponseDto>>('/refresh', { refreshToken });
    if (!response.success) {
      throw new Error(response.message || 'Token refresh failed');
    }
    return response.data;
  }

  async forgotPassword(dto: ForgotPasswordRequestDto): Promise<string> {
    const response = await this.post<ApiResponse<{ message: string }>>('/forgot-password', dto);
    if (!response.success) {
      throw new Error(response.message || 'Failed to send reset email');
    }
    return response.data?.message || 'Reset link sent';
  }

  async changePassword(dto: ChangePasswordRequestDto): Promise<void> {
    const response = await this.post<ApiResponse<unknown>>('/change-password', dto);
    if (!response.success) {
      throw new Error(response.message || 'Failed to change password');
    }
  }

  async getExternalProviders(): Promise<ExternalProviderDto[]> {
    const response = await this.get<GetExternalProvidersApiResponse>('/providers');
    return response.success ? response.data : [];
  }

  async getExternalProviderStatuses(): Promise<ExternalProviderStatusDto[]> {
    const response = await this.get<GetExternalProviderStatusesApiResponse>('/providers/status');
    if (!response.success) {
      throw new Error(response.message || 'Failed to load sign-in methods');
    }
    return response.data;
  }

  getExternalStartUrl(providerId: string, returnUrl: string): string {
    return `${AppConfig.api.baseURL}/Auth/external/${encodeURIComponent(providerId)}/start?returnUrl=${encodeURIComponent(returnUrl)}`;
  }

  async exchangeExternalCode(code: string): Promise<LoginResponseDto> {
    const response = await this.post<ApiResponse<LoginResponseDto>>('/external/exchange', { code });
    if (!response.success) {
      throw new Error(response.message || 'Sign-in failed');
    }
    return response.data;
  }
}
