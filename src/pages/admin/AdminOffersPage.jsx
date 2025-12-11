import { useCallback, useEffect, useMemo, useState } from "react";
import { FiRefreshCw, FiSearch, FiUser } from "react-icons/fi";
import AdminLayout from "../../components/admin/AdminLayout";
import OffersTable from "../../components/admin/offers/OffersTable";
import OffersTableSkeleton from "../../components/admin/offers/OffersTableSkeleton";
import LockOfferModal from "../../components/admin/offers/LockOfferModal";
import DeleteOfferModal from "../../components/admin/offers/DeleteOfferModal";
import ToastContainer from "../../components/admin/ToastContainer";
import {
  approveOffer,
  deleteOffer,
  getAllOffers,
  getPendingOffers,
  lockOffer,
} from "../../api/adminOffersApi";

const STATUS_TABS = [
  { key: "ALL", label: "All" },
  { key: "OPEN", label: "Pending" },
  { key: "ACTIVE", label: "Active" },
  { key: "DELETED", label: "Rejected" },
  { key: "LOCKED", label: "Locked" },
];

const normalizeOffers = (data) => {
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

const AdminOffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeTab, setActiveTab] = useState("OPEN");
  const [searchText, setSearchText] = useState("");
  const [sellerFilter, setSellerFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionState, setActionState] = useState(null);
  const [lockState, setLockState] = useState({ open: false, offer: null, reason: "", error: "" });
  const [deleteState, setDeleteState] = useState({ open: false, offer: null });
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((type, message, title = "") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [allRes, pendingRes] = await Promise.all([getAllOffers(), getPendingOffers()]);
      const allOffers = normalizeOffers(allRes);
      const pendingOffers = normalizeOffers(pendingRes);
      setOffers(allOffers);
      setPendingCount(pendingOffers.length);
    } catch (err) {
      setError("Failed to load offers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const filteredOffers = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    const sellerText = sellerFilter.trim().toLowerCase();

    return offers
      .filter((offer) => {
        if (activeTab !== "ALL") {
          return (offer.status || "").toUpperCase() === activeTab;
        }
        return true;
      })
      .filter((offer) => {
        if (!search) return true;
        const idMatch = String(offer.id || "").toLowerCase().includes(search);
        const productMatch = (offer.product_name || "").toLowerCase().includes(search);
        const sellerMatch = String(offer.seller_id || "").toLowerCase().includes(search);
        return idMatch || productMatch || sellerMatch;
      })
      .filter((offer) => {
        if (!sellerText) return true;
        const composite = `${offer.seller_id || ""} ${offer.seller_company || ""} ${offer.seller_name || ""}`.toLowerCase();
        return composite.includes(sellerText);
      });
  }, [offers, activeTab, searchText, sellerFilter]);

  const updateOfferStatus = (offerId, nextData) => {
    setOffers((prev) =>
      prev.map((item) => (item.id === offerId ? { ...item, ...nextData } : item))
    );
  };

  const decreasePendingIfNeeded = (prevStatus, nextStatus) => {
    if (prevStatus === "OPEN" && nextStatus !== "OPEN") {
      setPendingCount((count) => Math.max(0, count - 1));
    }
  };

  const handleApprove = async (offer) => {
    setActionState({ id: offer.id, type: "approve" });
    try {
      const updated = await approveOffer(offer.id);
      const updatedOffer = typeof updated === "object" ? updated : {};
      const nextStatus = updatedOffer.status || "ACTIVE";
      updateOfferStatus(offer.id, { ...offer, ...updatedOffer, status: nextStatus });
      decreasePendingIfNeeded(offer.status, nextStatus);
      showToast("success", `Offer #${offer.id} approved successfully.`);
    } catch (err) {
      showToast("error", "Failed to approve this offer.");
    } finally {
      setActionState(null);
    }
  };

  const handleLockOpen = (offer) => {
    setLockState({ open: true, offer, reason: "", error: "" });
  };

  const handleLockConfirm = async () => {
    if (!lockState.offer) return;
    if (!lockState.reason || lockState.reason.trim().length < 10) {
      setLockState((prev) => ({
        ...prev,
        error: "Reason must be at least 10 characters long.",
      }));
      return;
    }
    setActionState({ id: lockState.offer.id, type: "lock" });
    try {
      const updated = await lockOffer(lockState.offer.id, { reason: lockState.reason });
      const updatedOffer = typeof updated === "object" ? updated : {};
      const nextStatus = updatedOffer.status || "LOCKED";
      updateOfferStatus(lockState.offer.id, {
        ...lockState.offer,
        ...updatedOffer,
        status: nextStatus,
      });
      decreasePendingIfNeeded(lockState.offer.status, nextStatus);
      showToast("success", `Offer #${lockState.offer.id} locked.`);
      setLockState({ open: false, offer: null, reason: "", error: "" });
    } catch (err) {
      const errMsg =
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to lock this offer.";
      setLockState((prev) => ({ ...prev, error: errMsg }));
      showToast("error", "Failed to lock this offer.");
    } finally {
      setActionState(null);
    }
  };

  const handleDeleteOpen = (offer) => {
    setDeleteState({ open: true, offer });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteState.offer) return;
    setActionState({ id: deleteState.offer.id, type: "delete" });
    try {
      await deleteOffer(deleteState.offer.id);
      updateOfferStatus(deleteState.offer.id, { ...deleteState.offer, status: "DELETED" });
      decreasePendingIfNeeded(deleteState.offer.status, "DELETED");
      showToast("success", `Offer #${deleteState.offer.id} deleted.`);
      setDeleteState({ open: false, offer: null });
    } catch (err) {
      showToast("error", "Failed to delete this offer.");
    } finally {
      setActionState(null);
    }
  };

  return (
    <AdminLayout breadcrumb={["Admin", "Offers"]} pageTitle="Offers Moderation">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeTab === tab.key
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.key === "OPEN" ? (
                    <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-slate-900">
                      {pendingCount}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <FiRefreshCw className="h-4 w-4" />
              <button type="button" onClick={fetchOffers} className="font-semibold text-slate-700">
                Refresh
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search ID, product, or seller..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-10 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-amber-100"
              />
            </div>
            <div className="relative w-full md:w-64">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by Seller"
                value={sellerFilter}
                onChange={(e) => setSellerFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-10 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-amber-100"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <OffersTableSkeleton />
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-900 mb-2">No offers found.</p>
            <p className="text-sm text-slate-600">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <OffersTable
            offers={filteredOffers}
            onApprove={handleApprove}
            onLock={handleLockOpen}
            onDelete={handleDeleteOpen}
            actionState={actionState}
          />
        )}
      </div>

      <LockOfferModal
        open={lockState.open}
        offerId={lockState.offer?.id}
        reason={lockState.reason}
        onReasonChange={(reason) => setLockState((prev) => ({ ...prev, reason, error: "" }))}
        onClose={() => setLockState({ open: false, offer: null, reason: "", error: "" })}
        onConfirm={handleLockConfirm}
        loading={actionState?.type === "lock"}
        error={lockState.error}
      />

      <DeleteOfferModal
        open={deleteState.open}
        offerId={deleteState.offer?.id}
        onCancel={() => setDeleteState({ open: false, offer: null })}
        onConfirm={handleDeleteConfirm}
        loading={actionState?.type === "delete"}
      />
    </AdminLayout>
  );
};

export default AdminOffersPage;
