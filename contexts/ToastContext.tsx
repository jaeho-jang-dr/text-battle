"use client";

import React, { createContext, useContext } from "react";
import { ToastContainer, useToast as useToastHook } from "@/components/ui/toast";

type ToastContextType = ReturnType<typeof useToastHook>;

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toastMethods = useToastHook();

  return (
    <ToastContext.Provider value={toastMethods}>
      {children}
      <ToastContainer toasts={toastMethods.toasts} removeToast={toastMethods.removeToast} />
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