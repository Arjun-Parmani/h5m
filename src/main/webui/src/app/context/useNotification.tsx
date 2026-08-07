import { NotificationContext } from '@app/context/NotificationContext.tsx';
import { useContext } from 'react';

export const useNotification = () => useContext(NotificationContext);
