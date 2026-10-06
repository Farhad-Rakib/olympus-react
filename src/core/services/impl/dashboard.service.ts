import { BaseRepository } from '../../api/base.repository';
import { GetDashboardApiResponse, GetDashboardResponseDto } from '../../../domain/dto/dashboard.dto';
import { IDashboardService } from '../dashboard.service.interface';

export class DashboardService extends BaseRepository implements IDashboardService {
  constructor() {
    super('/Dashboard');
  }

  async getDashboardData(days: number): Promise<GetDashboardResponseDto> {
    const response = await this.get<GetDashboardApiResponse>('', { params: { days } });
    if (!response.success) {
      throw new Error(response.message || 'Failed to load dashboard');
    }
    return response.data;
  }
}
