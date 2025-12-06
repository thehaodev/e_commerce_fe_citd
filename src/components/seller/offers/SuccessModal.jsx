import React from "react";
import { FiCheckCircle } from "react-icons/fi";

const SuccessModal = ({ open, title, message, onPrimary }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
            <FiCheckCircle className="text-emerald-600" size={26} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-600">{message}</p>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onPrimary}
            className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow hover:bg-amber-600"
          >
            Go to My Offers
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
