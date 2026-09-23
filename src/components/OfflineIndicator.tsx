import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 z-50 flex items-center gap-2 rounded-xl bg-[#ba1a1a] px-3.5 py-2 text-xs font-bold text-white shadow-xl animate-bounce">
      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
      <span>Offline Mode — Cached student database active</span>
    </div>
  );
};
