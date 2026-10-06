import { ExternalProviderDto, ExternalProviderStatusDto } from '../../domain/dto/external-auth.dto';
import { LoginRequestDto, LoginResponseDto, RefreshTokenResponseDto, RegisterRequestDto, RegisterResponseDto } from '../../domain/dto/auth.dto';

export interface IAuthService {
  login(dto: LoginRequestDto): Promise<LoginResponseDto>;
  register(dto: RegisterRequestDto): Promise<RegisterResponseDto>;
  logout(refreshToken?: string | null): Promise<void>;
  refreshToken(refreshToken: string): Promise<RefreshTokenResponseDto>;
  /** Sign-in providers that are switched on and configured. */
  getExternalProviders(): Promise<ExternalProviderDto[]>;
  /** All providers with their flag and configuration state (needs site-settings.read). */
  getExternalProviderStatuses(): Promise<ExternalProviderStatusDto[]>;
  /** URL the browser navigates to (full page) to start sign-in with a provider. */
  getExternalStartUrl(providerId: string, returnUrl: string): string;
  /** Trades the one-time code from the provider callback for tokens. */
  exchangeExternalCode(code: string): Promise<LoginResponseDto>;
}
