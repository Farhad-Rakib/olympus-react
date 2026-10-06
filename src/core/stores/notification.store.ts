import { create } from 'zustand';
import { notificationApi } from '../api/services/notification.api';
import { NotificationDto, NotificationType } from '../../domain/dto/notification.dto';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  /** Replaces the list with the signed-in user's notifications from the API. */
  load: () => Promise<void>;
  /** Adds a notification pushed over the hub (ignored if already present). */
  receive: (dto: NotificationDto) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  clearAll: () => void;
}

const toNotification = (dto: NotificationDto): Notification => ({
  id: String(dto.id),
  title: dto.title,
  message: dto.message,
  type: dto.type,
  read: dto.isRead,
  timestamp: dto.createdAt,
});

const countUnread = (notifications: Notification[]) => notifications.filter((n) => !n.read).length;

export const useNotificationStore = create<NotificationState>((set, get) => {
  // Apply a change locally right away; reload from the API if the server rejects it.
  const optimistic = async (update: (list: Notification[]) => Notification[], request: () => Promise<void>) => {
    const next = update(get().notifications);
    set({ notifications: next, unreadCount: countUnread(next) });
    try {
      await request();
    } catch {
      await get().load();
    }
  };

  return {
    notifications: [],
    unreadCount: 0,

    load: async () => {
      try {
        const notifications = (await notificationApi.getMine()).map(toNotification);
        set({ notifications, unreadCount: countUnread(notifications) });
      } catch {
        // Keep the current list; the bell simply stays as it was.
      }
    },

    receive: (dto) => {
      if (get().notifications.some((n) => n.id === String(dto.id))) return;
      const notifications = [toNotification(dto), ...get().notifications];
      set({ notifications, unreadCount: countUnread(notifications) });
    },

    markAsRead: (id) =>
      optimistic(
        (list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)),
        () => notificationApi.markAsRead(Number(id)),
      ),

    markAllAsRead: () =>
      optimistic(
        (list) => list.map((n) => ({ ...n, read: true })),
        () => notificationApi.markAllAsRead(),
      ),

    removeNotification: (id) =>
      optimistic(
        (list) => list.filter((n) => n.id !== id),
        () => notificationApi.remove(Number(id)),
      ),

    clearAll: () => set({ notifications: [], unreadCount: 0 }),
  };
});
