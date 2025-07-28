'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import type { NotificationData } from '@/lib/utils/notification-cookies';

export function ToastHandler() {
  useEffect(() => {
    // Get notification from cookie
    const notification = document.cookie
      .split('; ')
      .find(row => row.startsWith('notification='))
      ?.split('=')[1];
      
    if (notification) {
      try {
        const { type, message }: NotificationData = JSON.parse(decodeURIComponent(notification));
        
        // Display toast based on type
        switch (type) {
          case 'success':
            toast.success(message);
            break;
          case 'error':
            toast.error(message);
            break;
          case 'info':
            toast.info(message);
            break;
          case 'warning':
            toast.warning(message);
            break;
          default:
            toast(message);
        }
        
        // Clear the cookie after displaying the toast
        document.cookie = 'notification=; Max-Age=0; path=/';
      } catch (error) {
        console.error('Failed to parse notification cookie:', error);
        // Clear malformed cookie
        document.cookie = 'notification=; Max-Age=0; path=/';
      }
    }
  }, []); // Empty dependency array - only run once on mount

  return null;
}
