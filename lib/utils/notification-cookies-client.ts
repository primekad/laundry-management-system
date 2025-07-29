'use client';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationData {
  type: NotificationType;
  message: string;
}

// Client-side functions (for use in Client Components)
/**
 * Get notification data from cookie on the client side
 */
export function getNotificationClient(): NotificationData | null {
  if (typeof window === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const notificationCookie = cookies.find(cookie => 
    cookie.trim().startsWith('notification=')
  );
  
  if (!notificationCookie) return null;
  
  try {
    const value = notificationCookie.split('=')[1];
    return value ? JSON.parse(decodeURIComponent(value)) : null;
  } catch {
    return null;
  }
}

/**
 * Clear notification cookie on the client side
 */
export function clearNotificationClient(): void {
  if (typeof window === 'undefined') return;
  
  document.cookie = 'notification=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

/**
 * Convenience function to get success notification on client side
 */
export function getSuccessNotification(): string | null {
  const notification = getNotificationClient();
  return notification?.type === 'success' ? notification.message : null;
}

/**
 * Convenience function to get error notification on client side
 */
export function getErrorNotification(): string | null {
  const notification = getNotificationClient();
  return notification?.type === 'error' ? notification.message : null;
}

/**
 * Convenience function to get info notification on client side
 */
export function getInfoNotification(): string | null {
  const notification = getNotificationClient();
  return notification?.type === 'info' ? notification.message : null;
}

/**
 * Convenience function to get warning notification on client side
 */
export function getWarningNotification(): string | null {
  const notification = getNotificationClient();
  return notification?.type === 'warning' ? notification.message : null;
}

/**
 * Convenience function to clear notification on client side
 */
export function clearSuccessNotification(): void {
  clearNotificationClient();
}

/**
 * Convenience function to clear notification on client side
 */
export function clearErrorNotification(): void {
  clearNotificationClient();
}

/**
 * Convenience function to clear notification on client side
 */
export function clearInfoNotification(): void {
  clearNotificationClient();
}

/**
 * Convenience function to clear notification on client side
 */
export function clearWarningNotification(): void {
  clearNotificationClient();
}
