import * as React from "react";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToastContext, type ToastProps as BaseToastProps } from "./use-toast";

// Toast bileşeni için stil varyantları
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-md transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
        success:
          "success group border-success bg-success-light text-success-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Toast bileşeni için props tipi
export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants>,
    Omit<BaseToastProps, "variant"> {
  variant?: "default" | "destructive" | "success";
  onDismiss?: () => void;
}

export function Toast({
  className,
  variant,
  title,
  description,
  action,
  onDismiss,
  ...props
}: ToastProps) {
  return (
    <div
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      <div className="grid gap-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && (
          <div className="text-sm opacity-90">{description}</div>
        )}
      </div>

      {action && <div>{action}</div>}

      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Kapat</span>
      </button>
    </div>
  );
}

// Toaster bileşeni, toast'ları göstermek için kullanılır
export function Toaster() {
  const context = React.useContext(ToastContext);
  
  if (!context) {
    throw new Error("Toaster must be used within ToastProvider");
  }
  
  const { toasts, dismiss } = context;

  if (!toasts?.length) return null;

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          action={toast.action}
          onDismiss={() => dismiss(toast.id)}
        />
      ))}
    </div>
  );
} 