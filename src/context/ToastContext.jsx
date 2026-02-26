import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`toast toast-${toast.type}`}
            onClick={() => dismissToast(toast.id)}
          >
            <span className="toast-icon">
              {toast.type === 'success' && '✓'}
              {toast.type === 'error' && '✕'}
              {toast.type === 'warning' && '⚠'}
              {toast.type === 'info' && 'ℹ'}
            </span>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={(e) => { e.stopPropagation(); dismissToast(toast.id); }}>×</button>
          </div>
        ))}
      </div>

      <style>{`
        .toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 400px;
        }

        .toast {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          animation: toastSlideIn 0.3s ease;
          cursor: pointer;
          transition: transform 0.2s, opacity 0.2s;
        }

        .toast:hover {
          transform: translateX(-4px);
        }

        @keyframes toastSlideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .toast-success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .toast-error {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .toast-warning {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
        }

        .toast-info {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
        }

        .toast-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
          flex-shrink: 0;
        }

        .toast-message {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.4;
        }

        .toast-close {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s;
          flex-shrink: 0;
        }

        .toast-close:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        @media (max-width: 480px) {
          .toast-container {
            left: 10px;
            right: 10px;
            max-width: none;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
