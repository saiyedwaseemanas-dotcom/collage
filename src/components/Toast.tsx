import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-50 bg-[#283044] text-[#eef0ff] px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-2.5">
        {toast.type === 'error' ? (
          <AlertCircle className="w-5 h-5 text-[#ffb4ab] shrink-0" />
        ) : toast.type === 'warning' ? (
          <AlertTriangle className="w-5 h-5 text-[#ffba28] shrink-0" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-[#6ffbbe] shrink-0" />
        )}
        <span className="text-xs font-medium text-left">{toast.message}</span>
      </div>
      <span className="text-[10px] text-white/60 shrink-0 font-medium ml-2">Just now</span>
    </div>
  );
};
