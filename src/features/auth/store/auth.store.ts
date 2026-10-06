import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LoginRequestDto, LoginResponseDto } from '../../../domain/dto/auth.dto';
import { authApi } from '../../../core/api/services/auth.api';
import { menuApi } from '../../../core/api/services/menu.api';
import { AppConfig } from '../../../core/config/app.config';
import { isAxiosError } from 'axios';
import { queryClient } from '../../../app/providers/query-client';

interface TokenPayload {
  sub?: string;
  email?: string;
  name?: string;
  role?: string | string[];
  permissions?: string | string[];
  permission?: string | string[];
  [key: string]: unknown;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokenPayload: TokenPayload | null;
  login: (dto: LoginRequestDto) => Promise<void>;
  /** Completes sign-in with a one-time code from an external provider callback. */
  loginWithExternalCode: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

// JWT claims that can repeat are serialized as a string when there is one value
// and as an array when there are several; normalize both to an array.
function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value;
  return typeof value === 'string' && value ? [value] : [];
}

function getPermissions(payload: TokenPayload): string[] {
  return [...toArray(payload.permissions), ...toArray(payload.permission)];
}

function isSuperAdmin(payload: TokenPayload): boolean {
  return [...toArray(payload.role), ...toArray(payload[ROLE_CLAIM])].includes('SuperAdmin');
}

function decodeJwtPayload(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      // Shared by password and external sign-in: obtain tokens, then store the session.
      const startSession = async (request: () => Promise<LoginResponseDto>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await request();
          const payload = decodeJwtPayload(response.accessToken);

          set({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            tokenPayload: payload,
          });

          queryClient.prefetchQuery({
            queryKey: ['menu'],
            queryFn: () => menuApi.getMenuItems(),
          });
        } catch (error) {
          const message = (isAxiosError<{ message?: string }>(error) && error.response?.data?.message)
            || (error instanceof Error && error.message)
            || 'Login failed';
          set({
            error: message,
            isLoading: false,
            isAuthenticated: false,
          });
          throw new Error(message);
        }
      };

      return {
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      tokenPayload: null,

      login: (dto: LoginRequestDto) => startSession(() => authApi.login(dto)),

      loginWithExternalCode: (code: string) => startSession(() => authApi.exchangeExternalCode(code)),

      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout(get().refreshToken);
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          queryClient.clear();

          set({
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            tokenPayload: null,
          });

          const storage = AppConfig.auth.storageType === 'localStorage' ? localStorage : sessionStorage;
          storage.removeItem(AppConfig.auth.tokenKey);
        }
      },

      clearError: () => set({ error: null }),

      hasPermission: (permission: string): boolean => {
        const { tokenPayload } = get();
        if (!tokenPayload) return false;
        return isSuperAdmin(tokenPayload) || getPermissions(tokenPayload).includes(permission);
      },

      hasAnyPermission: (permissions: string[]): boolean => {
        const { tokenPayload } = get();
        if (!tokenPayload) return false;
        if (isSuperAdmin(tokenPayload)) return true;
        const perms = getPermissions(tokenPayload);
        return permissions.some(p => perms.includes(p));
      },

      hasAllPermissions: (permissions: string[]): boolean => {
        const { tokenPayload } = get();
        if (!tokenPayload) return false;
        if (isSuperAdmin(tokenPayload)) return true;
        const perms = getPermissions(tokenPayload);
        return permissions.every(p => perms.includes(p));
      },
      };
    },
    {
      name: AppConfig.auth.tokenKey,
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        tokenPayload: state.tokenPayload,
      }),
    }
  )
);
