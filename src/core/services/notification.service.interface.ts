import { NotificationDto } from '../../domain/dto/notification.dto';

export interface INotificationService {
  getMine(): Promise<NotificationDto[]>;
  markAsRead(id: number): Promise<void>;
  markAllAsRead(): Promise<void>;
  remove(id: number): Promise<void>;
}
