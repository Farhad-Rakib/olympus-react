import { ApiResponse } from './auth.dto';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/** Notification as returned by the API and pushed over the notification hub. */
export interface NotificationDto {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export type GetNotificationsApiResponse = ApiResponse<NotificationDto[]>;
