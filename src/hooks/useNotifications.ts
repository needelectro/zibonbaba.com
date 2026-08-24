'use client';

import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export function useNotifications() {
  const { fetchNotifications, isLoggedIn } = useStore();

  useEffect(() => {
    if (!isLoggedIn) return;

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);

    return () => clearInterval(interval);
  }, [isLoggedIn, fetchNotifications]);
}
