import { ApiResponse } from './auth.dto';

/** A sign-in button to show on the login page. */
export interface ExternalProviderDto {
  id: string;
  displayName: string;
}

/** Admin view of a provider: its site-setting flag and whether the server has credentials. */
export interface ExternalProviderStatusDto extends ExternalProviderDto {
  enabled: boolean;
  configured: boolean;
  settingKey: string;
}

export type GetExternalProvidersApiResponse = ApiResponse<ExternalProviderDto[]>;
export type GetExternalProviderStatusesApiResponse = ApiResponse<ExternalProviderStatusDto[]>;
