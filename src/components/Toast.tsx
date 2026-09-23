import React from 'react';
import { useApp } from '../context/AppContext';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-50 bg-[#283044] text-[#eef0ff] px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-2.5">
        <span className="material-symbols-outlined text-[20px] text-[#6ffbbe]">
          {toast.type === 'error' ? 'error' : toast.type === 'warning' ? 'warning' : 'check_circle'}
        </span>
        <span className="text-xs font-medium">{toast.message}</span>
      </div>
      <span className="text-[10px] text-white/60 shrink-0 font-medium">Just now</span>
    </div>
  );
};
