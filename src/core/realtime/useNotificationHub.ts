import { useEffect } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { AppConfig } from '../config/app.config';
import { useAuthStore } from '../../features/auth/store/auth.store';
import { useNotificationStore } from '../stores/notification.store';
import { NotificationDto } from '../../domain/dto/notification.dto';
import { toast } from '../../components/ui/Toast/toast.store';

const RECEIVE_NOTIFICATION = 'ReceiveNotification';

/**
 * Loads the signed-in user's notifications and keeps them live over the
 * notification hub. Reconnects automatically; disconnects on logout.
 */
export function useNotificationHub() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = useAuthStore((s) => s.tokenPayload?.sub);

  useEffect(() => {
    const { load, receive, clearAll } = useNotificationStore.getState();
    if (!isAuthenticated || !userId) {
      clearAll();
      return;
    }

    void load();

    const connection = new HubConnectionBuilder()
      .withUrl(AppConfig.hubs.notifications, {
        // Read the token on every (re)connect so a refreshed token is picked up.
        accessTokenFactory: () => useAuthStore.getState().accessToken ?? '',
      })
      .withAutomaticReconnect()
      .configureLogging(import.meta.env.DEV ? LogLevel.Warning : LogLevel.Error)
      .build();

    connection.on(RECEIVE_NOTIFICATION, (dto: NotificationDto) => {
      receive(dto);
      toast.info(dto.title);
    });
    // Anything pushed while disconnected is picked up by reloading.
    connection.onreconnected(() => void load());

    let stopped = false;
    const starting = connection.start().catch(() => {
      // The REST list still works without the live connection.
      if (!stopped && import.meta.env.DEV) console.warn('Notification hub connection failed');
    });

    return () => {
      stopped = true;
      // Stopping mid-negotiation (e.g. React StrictMode's double mount) makes SignalR
      // log an error, so let the start attempt settle first.
      void starting.finally(() => connection.stop());
    };
  }, [isAuthenticated, userId]);
}
