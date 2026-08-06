import { createContext, ReactNode } from 'react';

export type NotificationKind = 'error' | 'info' | 'success' | 'warning';

export const DEFAULT_NOTIFICATION_TIMEOUT = 10_000; // 10 seconds

export interface Notification {
  id: number;
  kind: NotificationKind;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  timeout: number;
}

export type NotificationUpdate = Partial<Omit<Notification, 'id'>>;

export interface NotificationContextValue {
  add: (kind: NotificationKind, title: string, subtitle?: string, timeout?: number) => number;
  info: (title: string) => number;
  success: (title: string) => number;
  warning: (title: string) => number;
  error: (title: string, subtitle?: string) => number;
  handleError: (title: string, reason: unknown) => number;
  update: (id: number, fields: NotificationUpdate) => void;
  remove: (id: number) => void;
}

export const NotificationContext = createContext<NotificationContextValue>({
  add: () => 0,
  info: () => 0,
  success: () => 0,
  warning: () => 0,
  error: () => 0,
  handleError: () => 0,
  update: () => {
    /* empty */
  },
  remove: () => {
    /* empty */
  },
});
