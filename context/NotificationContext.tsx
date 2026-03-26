import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info';

interface NotificationContextProps {
  showToast: (message: string, type?: NotificationType) => void;
  showConfirm: (message: string, onConfirm: () => void) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string; type: NotificationType } | null>(null);
  const [confirmData, setConfirmData] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const showToast = useCallback((message: string, type: NotificationType = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000); // 3 seconds timeout
  }, []);

  const showConfirm = useCallback((message: string, onConfirm: () => void) => {
    setConfirmData({ message, onConfirm });
  }, []);

  const handleConfirm = () => {
    if (confirmData) {
      confirmData.onConfirm();
      setConfirmData(null);
    }
  };

  const handleCancel = () => {
    setConfirmData(null);
  };

  return (
    <NotificationContext.Provider value={{ showToast, showConfirm }}>
      {children}
      
      {/* TOAST SYSTEM (Bottom Right) */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md animate-scaleIn border ${
            toast.type === 'success' ? 'bg-green-500/90 text-white border-green-400/50 shadow-green-500/30' :
            toast.type === 'error' ? 'bg-red-500/90 text-white border-red-400/50 shadow-red-500/30' :
            'bg-blue-500/90 text-white border-blue-400/50 shadow-blue-500/30'
        }`}>
            {toast.type === 'success' && <CheckCircle className="w-6 h-6 mr-3 text-white" />}
            {toast.type === 'error' && <AlertCircle className="w-6 h-6 mr-3 text-white" />}
            {toast.type === 'info' && <Info className="w-6 h-6 mr-3 text-white" />}
            <span className="font-semibold text-[15px]">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-4 p-1 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-4 h-4" />
            </button>
        </div>
      )}

      {/* CONFIRM MODAL (Center) */}
      {confirmData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-white/50 animate-scaleIn">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4 shadow-inner">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Xác nhận</h3>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        {confirmData.message}
                    </p>
                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={handleCancel}
                            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            onClick={handleConfirm}
                            className="flex-1 py-3 px-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-rose-600 hover:to-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            Đồng ý
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
