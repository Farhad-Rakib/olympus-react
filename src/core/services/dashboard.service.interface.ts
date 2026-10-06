import { GetDashboardResponseDto } from '../../domain/dto/dashboard.dto';

export interface IDashboardService {
  /** Dashboard metrics for the last `days` days (1-365). */
  getDashboardData(days: number): Promise<GetDashboardResponseDto>;
}
