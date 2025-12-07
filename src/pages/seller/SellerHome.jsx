import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle, FiPlus } from "react-icons/fi";
import SellerStats from "../../components/seller/SellerStats";
import RecentOffersTable from "../../components/seller/RecentOffersTable";
import { getMyOffers } from "../../api/offerApi";

const SellerHome = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await getMyOffers();
        const data = res?.data ?? res;
        if (isMounted) {
          setOffers(Array.isArray(data) ? data : data?.items || []);
        }
      } catch (err) {
        if (isMounted) setError(err?.message || "Unable to load offers.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = offers.length;
    const open = offers.filter((o) => o.status === "OPEN").length;
    const active = offers.filter((o) => o.status === "ACTIVE").length;
    const locked = offers.filter((o) => o.status === "LOCKED").length;
    return { total, open, active, locked };
  }, [offers]);

  const recent = useMemo(
    () =>
      [...offers]
        .sort(
          (a, b) =>
            new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt)
        )
        .slice(0, 5),
    [offers]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white/90 backdrop-blur px-6 py-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
            Seller Dashboard
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Home</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/seller/offers")}
            className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:border-amber-300"
          >
            View My Offers
          </button>
          <button
            type="button"
            onClick={() => navigate("/seller/offers/new")}
            className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow hover:bg-amber-600"
          >
            <FiPlus /> Create New Offer
          </button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-6">
        <SellerStats
          total={stats.total}
          open={stats.open}
          active={stats.active}
          locked={stats.locked}
          loading={loading}
        />

        {loading ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm animate-pulse">
            <div className="h-6 w-32 bg-slate-200 rounded mb-4" />
            <div className="h-12 bg-slate-200 rounded" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center gap-2">
            <FiAlertCircle />
            <span>{error}</span>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="ml-auto text-amber-700 font-semibold hover:text-amber-800"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Recent Offers</h2>
              <button
                type="button"
                onClick={() => navigate("/seller/offers")}
                className="text-sm font-semibold text-amber-700 hover:text-amber-800"
              >
                View all
              </button>
            </div>
            <RecentOffersTable offers={recent} />
          </div>
        )}
      </main>
    </div>
  );
};

export default SellerHome;
