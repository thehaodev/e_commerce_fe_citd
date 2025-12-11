import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle, FiPlus } from "react-icons/fi";
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

  const today = useMemo(() => new Date(), []);
  const formattedDate = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return formatter.format(today);
  }, [today]);

  const formattedTime = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    return formatter.format(today);
  }, [today]);

  const statusStyle = (status) => {
    const key = (status || "").toUpperCase();
    const map = {
      OPEN: "bg-rose-100 text-rose-600",
      ACTIVE: "bg-emerald-100 text-emerald-700",
      LOCKED: "bg-slate-200 text-slate-700",
      INTERESTED: "bg-amber-100 text-amber-700",
      CLOSED: "bg-emerald-100 text-emerald-700",
      EXPIRED: "bg-orange-100 text-orange-700",
      WITHDRAWN: "bg-rose-200 text-rose-800",
      PRIVATE_OFFER_CREATED: "bg-indigo-100 text-indigo-700",
    };
    return map[key] || "bg-slate-100 text-slate-700";
  };

  const incotermBadge = (value) =>
    value ? (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
        {value}
      </span>
    ) : (
      <span className="text-xs text-slate-400">—</span>
    );

  const formatPrice = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toISOString().split("T")[0];
  };

  const formatOfferId = (offer) => {
    const id = offer?.id || offer?.offer_id || offer?.offerId;
    if (!id) return "#OFFER";
    return `#OFFER-${id}`;
  };

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        <div className="grid gap-6 md:grid-cols-[230px,1fr]">
          <aside className="hidden h-full flex-col gap-4 rounded-3xl bg-white/70 p-4 shadow-sm border border-slate-200/60 md:flex">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-900 text-white px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-lg font-semibold">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-5 w-5"
                >
                  <path d="M5 3h7a2 2 0 012 2v14a1 1 0 01-1 1H6a1 1 0 01-1-1V3z" />
                  <path d="M9 7h6a2 2 0 012 2v10a1 1 0 01-1 1h-7a1 1 0 01-1-1V7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold">Manage Offer</p>
                <p className="text-xs text-white/70">Quick actions</p>
              </div>
            </div>

            <nav className="space-y-2 text-sm font-semibold text-slate-700">
              <button
                type="button"
                onClick={() => navigate("/seller/offers")}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-amber-50 hover:text-amber-700"
              >
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Manage Offer
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              >
                <span className="h-2 w-2 rounded-full bg-slate-300" />
                Setting
              </button>
            </nav>

            <div className="mt-auto rounded-2xl border border-slate-200 px-4 py-3 text-xs text-slate-500">
              <p className="font-semibold text-slate-800">Workspace</p>
              <div className="mt-2 flex items-center justify-between">
                <span>Matrix Domain</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 text-slate-400"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 12a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 9.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </aside>

          <main className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900">Today</p>
                  <p className="text-sm text-slate-500">
                    {formattedDate} | {formattedTime}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {stats.total} offers • {stats.open} open • {stats.active} active
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/seller/offers/new")}
                  className="inline-flex items-center gap-3 rounded-2xl bg-amber-400 px-5 py-3 text-base font-semibold text-slate-900 shadow hover:bg-amber-500"
                >
                  <span>Create Offer New</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-amber-500 shadow">
                    <FiPlus />
                  </span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 h-6 w-32 animate-pulse rounded bg-slate-200" />
                <div className="space-y-3">
                  {[...Array(5)].map((_, idx) => (
                    <div key={idx} className="h-12 w-full animate-pulse rounded bg-slate-100" />
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <FiAlertCircle />
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="ml-auto text-rose-700 underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between px-6 py-5">
                  <div>
                    <p className="text-xl font-semibold text-slate-900">Recent Offer</p>
                    <p className="text-sm text-slate-500">Latest activity from your offers</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/seller/offers")}
                    className="text-sm font-semibold text-amber-600 hover:text-amber-700"
                  >
                    View all Offers
                  </button>
                </div>

                <div className="border-t border-slate-100">
                  <div className="grid grid-cols-7 items-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <span>Offer ID</span>
                    <span>Product Name</span>
                    <span className="text-center">
                      Total Price
                      <span className="block text-[11px] font-normal text-slate-400">(qty x price)</span>
                    </span>
                    <span className="text-center">Incoterm</span>
                    <span className="text-center">Status</span>
                    <span className="text-center">Delivery Time</span>
                    <span className="text-right">Details</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {recent.map((offer) => (
                      <div
                        key={offer.id || offer.offer_id}
                        className="grid grid-cols-7 items-center gap-2 px-6 py-4 text-sm text-slate-800"
                      >
                        <span className="font-semibold text-slate-900">{formatOfferId(offer)}</span>
                        <span className="text-slate-700">{offer.product_name || offer.productName}</span>
                        <span className="text-center font-semibold">{formatPrice(offer.price)}</span>
                        <div className="flex items-center justify-center">{incotermBadge(offer.seller_incoterm || offer.incoterm || offer.buyer_incoterm)}</div>
                        <div className="flex justify-center">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(offer.status)}`}>
                            {(offer.status || "").replace(/_/g, " ") || "—"}
                          </span>
                        </div>
                        <span className="text-center text-slate-700">
                          {formatDate(offer.cargo_ready_date || offer.delivery_time || offer.deliveryDate)}
                        </span>
                        <div className="text-right">
                          <button
                            type="button"
                            onClick={() => navigate(`/seller/offers/${offer.id || offer.offer_id}`)}
                            className="text-xs font-semibold text-amber-600 hover:text-amber-700"
                          >
                            View details
                          </button>
                        </div>
                      </div>
                    ))}
                    {recent.length === 0 && (
                      <div className="px-6 py-6 text-center text-sm text-slate-500">
                        No recent offers yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SellerHome;
