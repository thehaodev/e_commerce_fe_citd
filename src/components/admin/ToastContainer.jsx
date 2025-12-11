import React from "react";
import { FiAlertTriangle, FiCheckCircle, FiX } from "react-icons/fi";

const toneMap = {
  success: {
    icon: <FiCheckCircle className="h-5 w-5 text-emerald-600" />,
    border: "border-emerald-200",
    background: "bg-emerald-50",
    text: "text-emerald-800",
  },
  error: {
    icon: <FiAlertTriangle className="h-5 w-5 text-rose-600" />,
    border: "border-rose-200",
    background: "bg-rose-50",
    text: "text-rose-800",
  },
  info: {
    icon: <FiAlertTriangle className="h-5 w-5 text-slate-600" />,
    border: "border-slate-200",
    background: "bg-white",
    text: "text-slate-800",
  },
};

const ToastContainer = ({ toasts, onDismiss }) => {
  if (!toasts?.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {toasts.map((toast) => {
        const tone = toneMap[toast.type] || toneMap.info;
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${tone.background} ${tone.border}`}
          >
            <div className="mt-0.5">{tone.icon}</div>
            <div className={`flex-1 text-sm leading-relaxed ${tone.text}`}>
              {toast.title ? <p className="font-semibold">{toast.title}</p> : null}
              <p className="text-sm">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => onDismiss?.(toast.id)}
              className="text-slate-400 hover:text-slate-600"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;

