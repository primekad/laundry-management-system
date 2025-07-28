import { cookies } from 'next/headers';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationData {
  type: NotificationType;
  message: string;
}

/**
 * Set a notification cookie that will be displayed as a toast on the client
 * @param type - The type of notification (success, error, info, warning)
 * @param message - The message to display
 * @param maxAge - How long the cookie should persist in seconds (default: 10)
 */
export async function setNotificationCookie(
  type: NotificationType,
  message: string,
  maxAge: number = 10
): Promise<void> {
  const cookieStore = await cookies();
  const notificationData: NotificationData = { type, message };
  
  cookieStore.set('notification', JSON.stringify(notificationData), {
    maxAge,
    httpOnly: false, // Allow client-side access
    path: '/',
    sameSite: 'lax'
  });
}

/**
 * Convenience function to set a success notification cookie
 */
export async function setSuccessNotification(message: string): Promise<void> {
  return setNotificationCookie('success', message);
}

/**
 * Convenience function to set an error notification cookie
 */
export async function setErrorNotification(message: string): Promise<void> {
  return setNotificationCookie('error', message);
}

/**
 * Convenience function to set an info notification cookie
 */
export async function setInfoNotification(message: string): Promise<void> {
  return setNotificationCookie('info', message);
}

/**
 * Convenience function to set a warning notification cookie
 */
export async function setWarningNotification(message: string): Promise<void> {
  return setNotificationCookie('warning', message);
}
