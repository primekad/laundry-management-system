'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { getSuccessNotification, clearSuccessNotification } from '@/lib/utils/notification-cookies-client';

export function ToastHandler() {
  useEffect(() => {
    const message = getSuccessNotification();
    if (message) {
      toast.success(message);
      clearSuccessNotification();
    }
  }, []);

  return null;
}
