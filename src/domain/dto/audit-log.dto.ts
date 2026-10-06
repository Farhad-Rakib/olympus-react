import { ApiResponse } from './auth.dto';

export interface AuditLogDto {
  id: number;
  userId: number | null;
  userName: string | null;
  action: string;
  path: string;
  method: string;
  requestBody: string | null;
  responseBody: string | null;
  statusCode: number | null;
  userAgent: string | null;
  success: boolean;
  timestamp: string;
  ip: string | null;
}

export interface AuditLogQuery {
  action?: string;
  success?: boolean;
  from?: string;
  to?: string;
  page: number;
  pageSize: number;
}

export interface AuditLogPage {
  items: AuditLogDto[];
  total: number;
  page: number;
  pageSize: number;
}

export type GetAuditLogsApiResponse = ApiResponse<AuditLogPage>;
