import React from "react";
import { FiLock, FiX } from "react-icons/fi";

const LockOfferModal = ({
  open,
  offerId,
  reason,
  onReasonChange,
  onClose,
  onConfirm,
  loading = false,
  error = "",
}) => {
  if (!open) return null;

  const isDisabled = !reason || reason.trim().length < 10 || loading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={loading ? undefined : onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center">
              <FiLock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Lock Offer #{offerId}</h3>
              <p className="text-sm text-slate-600">
                Provide a reason for locking this offer. This will be visible to the seller.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800">Reason for locking</label>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => onReasonChange?.(e.target.value)}
            maxLength={200}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            placeholder="Write at least 10 characters explaining why this offer is being locked..."
          />
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{Math.max(reason?.length || 0, 0)} / 200</span>
            <span className={reason?.length >= 10 ? "text-emerald-600" : "text-rose-500"}>
              Minimum 10 characters
            </span>
          </div>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDisabled}
            className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-rose-600 disabled:opacity-60"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <FiLock className="h-4 w-4" />
            )}
            Lock Offer
          </button>
        </div>
      </div>
    </div>
  );
};

export default LockOfferModal;
