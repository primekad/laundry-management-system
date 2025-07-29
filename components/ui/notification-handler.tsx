'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { getNotificationClient, clearNotificationClient } from '@/lib/utils/notification-cookies-client';

export function NotificationHandler() {
  useEffect(() => {
    const notification = getNotificationClient();
    if (notification) {
      switch (notification.type) {
        case 'success':
          toast.success(notification.message);
          break;
        case 'error':
          toast.error(notification.message);
          break;
        case 'info':
          toast.info(notification.message);
          break;
        case 'warning':
          toast.warning(notification.message);
          break;
      }
      clearNotificationClient();
    }
  }, []);

  return null;
}
