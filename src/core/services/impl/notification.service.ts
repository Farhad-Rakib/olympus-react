import { BaseRepository } from '../../api/base.repository';
import { GetNotificationsApiResponse, NotificationDto } from '../../../domain/dto/notification.dto';
import { INotificationService } from '../notification.service.interface';

export class NotificationService extends BaseRepository implements INotificationService {
  constructor() {
    super('/Notifications');
  }

  async getMine(): Promise<NotificationDto[]> {
    const response = await this.get<GetNotificationsApiResponse>('');
    if (!response.success) {
      throw new Error(response.message || 'Failed to load notifications');
    }
    return response.data;
  }

  async markAsRead(id: number): Promise<void> {
    await this.post<unknown>(`/${id}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await this.post<unknown>('/read-all');
  }

  async remove(id: number): Promise<void> {
    await this.delete<unknown>(`/${id}`);
  }
}
