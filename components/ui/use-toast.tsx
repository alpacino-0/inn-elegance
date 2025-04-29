import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type ToastVariant = "default" | "destructive" | "success";

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  action?: ReactNode;
  duration?: number;
  id?: string;
  open?: boolean;
}

interface ToastState extends ToastProps {
  id: string;
  open: boolean;
}

interface ToastContextValue {
  toasts: ToastState[];
  toast: (props: ToastProps) => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
}

export const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
  clearAll: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const toast = (props: ToastProps) => {
    const id = props.id || Date.now().toString();
    const newToast: ToastState = {
      id,
      open: true,
      duration: 5000,
      ...props,
    };

    setToasts((prev) => [...prev, newToast]);

    if (newToast.duration !== Number.POSITIVE_INFINITY) {
      setTimeout(() => {
        dismiss(id);
      }, newToast.duration);
    }
  };

  const dismiss = (id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, open: false } : t))
    );

    // Animasyon bittikten sonra toast'u kaldır
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  };

  const clearAll = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss, clearAll }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  
  return context;
}

// Kullanım örnekleri:
// 1. _app.tsx veya layout.tsx dosyasında:
// <ToastProvider>
//   <Component {...pageProps} />
//   <Toaster />
// </ToastProvider>
//
// 2. Herhangi bir bileşende:
// const { toast } = useToast();
// toast({ title: "Başarılı", description: "İşlem tamamlandı", variant: "success" }); 