import { LoginRequestDto, LoginResponseDto, RefreshTokenResponseDto, RegisterRequestDto, RegisterResponseDto } from '../../domain/dto/auth.dto';

export interface IAuthService {
  login(dto: LoginRequestDto): Promise<LoginResponseDto>;
  register(dto: RegisterRequestDto): Promise<RegisterResponseDto>;
  logout(): Promise<void>;
  refreshToken(refreshToken: string): Promise<RefreshTokenResponseDto>;
}
