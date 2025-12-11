import React from "react";
import { Link } from "react-router-dom";
import { FiCheck, FiEye, FiLock, FiTrash2 } from "react-icons/fi";
import StatusBadge from "../StatusBadge";

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const formatPrice = (price) => {
  if (price === undefined || price === null || Number.isNaN(Number(price))) return "N/A";
  return Number(price).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const OffersTable = ({ offers, onApprove, onLock, onDelete, actionState }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="grid grid-cols-12 items-center gap-4 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <div className="col-span-2">Offer ID</div>
        <div className="col-span-2">Seller</div>
        <div className="col-span-2">Product Info</div>
        <div className="col-span-2">Incoterm / Price</div>
        <div className="col-span-2">Created</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>
      <div className="divide-y divide-slate-100">
        {offers.map((offer) => {
          const isActing = actionState?.id === offer.id;
          return (
            <div key={offer.id} className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-slate-50/60">
              <div className="col-span-2 flex flex-col gap-1">
                <span className="font-mono text-sm text-slate-900">#{offer.id}</span>
                <Link
                  to={`/admin/offers/${offer.id}`}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1"
                >
                  <FiEye className="h-3.5 w-3.5" /> View
                </Link>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-semibold text-slate-900">
                  {offer.seller_company || offer.seller_name || `Seller ${offer.seller_id || "-"}`}
                </p>
                <p className="text-xs text-slate-500">ID: {offer.seller_id || "N/A"}</p>
                {offer.seller_email ? (
                  <p className="text-xs text-slate-500">{offer.seller_email}</p>
                ) : null}
              </div>
              <div className="col-span-2">
                <p className="text-sm font-semibold text-slate-900">{offer.product_name || "N/A"}</p>
                <p className="text-xs text-slate-500">Qty: {offer.quantity ?? "N/A"}</p>
              </div>
              <div className="col-span-2 text-sm text-slate-800">
                <p className="font-semibold text-slate-900">{offer.seller_incoterm || "N/A"}</p>
                <p className="text-xs text-slate-600">${formatPrice(offer.price)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-slate-900">{formatDate(offer.created_at || offer.createdAt)}</p>
                {offer.port_of_loading ? (
                  <p className="text-xs text-slate-500">Port: {offer.port_of_loading}</p>
                ) : null}
              </div>
              <div className="col-span-1">
                <StatusBadge status={offer.status} />
              </div>
              <div className="col-span-1 flex flex-col items-end gap-2 text-sm">
                {offer.status === "OPEN" ? (
                  <>
                    <button
                      type="button"
                      disabled={isActing}
                      onClick={() => onApprove?.(offer)}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-600 disabled:opacity-60"
                    >
                      {isActing && actionState?.type === "approve" ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <FiCheck className="h-3.5 w-3.5" />
                      )}
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={isActing}
                      onClick={() => onLock?.(offer)}
                      className="inline-flex items-center gap-1 rounded-full border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                    >
                      <FiLock className="h-3.5 w-3.5" />
                      Lock
                    </button>
                    <button
                      type="button"
                      disabled={isActing}
                      onClick={() => onDelete?.(offer)}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </>
                ) : offer.status === "ACTIVE" ? (
                  <>
                    <button
                      type="button"
                      disabled={isActing}
                      onClick={() => onLock?.(offer)}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                      <FiLock className="h-3.5 w-3.5" />
                      Lock
                    </button>
                    <Link
                      to={`/admin/offers/${offer.id}`}
                      className="text-xs font-semibold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1"
                    >
                      <FiEye className="h-3.5 w-3.5" />
                      View
                    </Link>
                  </>
                ) : (
                  <Link
                    to={`/admin/offers/${offer.id}`}
                    className="text-xs font-semibold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1"
                  >
                    <FiEye className="h-3.5 w-3.5" />
                    View
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OffersTable;

