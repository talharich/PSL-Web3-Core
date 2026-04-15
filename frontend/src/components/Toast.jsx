import { useState, createContext, useContext, useCallback, useRef, useEffect } from 'react';
import { X, TrendingUp, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: TrendingUp,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const STYLES = {
  success: {
    glow: 'from-transparent via-green-400/60 to-transparent',
    iconBg: 'bg-green-400/10 border-green-400/20',
    iconShadow: 'shadow-[0_0_20px_rgba(34,197,94,0.2)]',
    iconColor: 'text-green-400',
    label: 'text-green-400',
    bar: 'bg-green-400',
    barBg: 'bg-green-400/30',
    labelText: 'SUCCESS',
  },
  error: {
    glow: 'from-transparent via-red-400/60 to-transparent',
    iconBg: 'bg-red-400/10 border-red-400/20',
    iconShadow: 'shadow-[0_0_20px_rgba(248,113,113,0.2)]',
    iconColor: 'text-red-400',
    label: 'text-red-400',
    bar: 'bg-red-400',
    barBg: 'bg-red-400/30',
    labelText: 'ERROR',
  },
  info: {
    glow: 'from-transparent via-blue-400/60 to-transparent',
    iconBg: 'bg-blue-400/10 border-blue-400/20',
    iconShadow: 'shadow-[0_0_20px_rgba(96,165,250,0.2)]',
    iconColor: 'text-blue-400',
    label: 'text-blue-400',
    bar: 'bg-blue-400',
    barBg: 'bg-blue-400/30',
    labelText: 'INFO',
  },
  warning: {
    glow: 'from-transparent via-yellow-400/60 to-transparent',
    iconBg: 'bg-yellow-400/10 border-yellow-400/20',
    iconShadow: 'shadow-[0_0_20px_rgba(250,204,21,0.2)]',
    iconColor: 'text-yellow-400',
    label: 'text-yellow-400',
    bar: 'bg-yellow-400',
    barBg: 'bg-yellow-400/30',
    labelText: 'WARNING',
  },
};

const MAX_TOASTS = 5;
const DURATION = 5000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeouts = useRef(new Map());

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    clearTimeout(timeouts.current.get(id));
    timeouts.current.delete(id);
  }, []);

  const addToast = useCallback((msg) => {
    const id = crypto.randomUUID();

    const toast = typeof msg === 'string'
      ? { message: msg, type: 'success' }
      : { type: 'success', ...msg };

    setToasts(prev => {
      const next = [...prev, { id, ...toast }];
      return next.length > MAX_TOASTS ? next.slice(-MAX_TOASTS) : next;
    });

    const timeoutId = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      timeouts.current.delete(id);
    }, DURATION);

    timeouts.current.set(id, timeoutId);
  }, []);

  const pause = useCallback((id) => {
    clearTimeout(timeouts.current.get(id));
  }, []);

  const resume = useCallback((id) => {
    const timeoutId = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      timeouts.current.delete(id);
    }, DURATION);
    timeouts.current.set(id, timeoutId);
  }, []);

  useEffect(() => {
    return () => {
      timeouts.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}

      <div className="fixed top-20 right-5 z-50 flex flex-col gap-3 w-80">
        {toasts.map((t) => {
          const type = t.type || 'success';
          const s = STYLES[type] || STYLES.success;
          const Icon = ICONS[type] || ICONS.success;

          return (
            <div
              key={t.id}
              onMouseEnter={() => pause(t.id)}
              onMouseLeave={() => resume(t.id)}
              className="
                relative overflow-hidden
                backdrop-blur-xl
                border border-white/10
                bg-white/5
                shadow-[0_20px_60px_rgba(0,0,0,0.6)]
                animate-slide-right
                hover:scale-[1.02]
                transition-all duration-300
              "
            >
              <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r ${s.glow}`} />

              <div className="flex items-start gap-3 p-4">
                <div className={`w-9 h-9 flex items-center justify-center shrink-0 border ${s.iconBg} ${s.iconShadow}`}>
                  <Icon size={16} className={s.iconColor} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold tracking-widest ${s.label}`}>
                    {s.labelText}
                  </p>
                  <p className="text-gray-300 text-sm mt-1 leading-snug">
                    {t.message}
                  </p>
                </div>

                <button
                  onClick={() => remove(t.id)}
                  className="text-gray-500 hover:text-white transition-all duration-200 hover:scale-110"
                >
                  <X size={14} />
                </button>
              </div>

              <div className={`absolute bottom-0 left-0 h-[2px] w-full ${s.barBg} overflow-hidden`}>
                <div
                  className={`h-full ${s.bar}`}
                  style={{ animation: 'toastProgress 5s linear forwards' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}