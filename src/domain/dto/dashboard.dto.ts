import { DashboardData } from '../models/dashboard.model';
import { ApiResponse } from './auth.dto';

export type GetDashboardResponseDto = DashboardData;
export type GetDashboardApiResponse = ApiResponse<DashboardData>;
