import { useState, useEffect } from 'react';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingChanges, setPendingChanges] = useState<number>(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline && pendingChanges > 0) {
      // Sync logic here
      console.log('Syncing data...');
    }
  }, [isOnline, pendingChanges]);

  const markPendingChange = () => setPendingChanges((n) => n + 1)
  const clearPendingChanges = () => setPendingChanges(0)

  return { isOnline, pendingChanges, markPendingChange, clearPendingChanges };
};
