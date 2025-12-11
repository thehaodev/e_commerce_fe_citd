import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle } from "react-icons/fi";
import { getMyOffers } from "../../api/offerApi";

const statusStyle = (status) => {
  const key = (status || "").toUpperCase();
  const map = {
    OPEN: "bg-pink-100 text-pink-700",
    INTERESTED: "bg-[#5F3B16]/10 text-[#5F3B16]",
    ACTIVE: "bg-emerald-100 text-emerald-700",
    LOCKED: "bg-slate-200 text-slate-700",
    CLOSED: "bg-green-100 text-green-700",
    EXPIRED: "bg-yellow-100 text-yellow-800",
    WITHDRAWN: "bg-red-100 text-red-700",
    PRIVATE_OFFER_CREATED: "bg-blue-100 text-blue-700",
  };
  return map[key] || "bg-slate-100 text-slate-700";
};

const incotermBadge = (value) =>
  value ? (
    <span className="inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-[11px] font-medium text-slate-700">
      {value}
    </span>
  ) : (
    <span className="text-xs text-slate-400">—</span>
  );

const formatTotalPrice = (offer) => {
  const qty = Number(offer.quantity);
  const price = Number(offer.price);
  const total = !Number.isNaN(qty) && !Number.isNaN(price) ? qty * price : Number(offer.price);
  if (total === null || total === undefined || Number.isNaN(total)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(total);
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

  const recent = useMemo(
    () =>
      [...offers]
        .sort(
          (a, b) =>
            new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt)
        )
        .slice(0, 8),
    [offers]
  );

  const formattedDate = useMemo(() => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    return formatter.format(now);
  }, []);

  return (
    <div className="px-4 py-6 md:px-10 md:py-8 space-y-8 bg-[#F5F5F5]">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-wide text-orange-500 uppercase mb-1">
            Seller Dashboard
          </p>
          <h2 className="text-3xl font-semibold text-slate-900">Today</h2>
          <p className="text-sm text-slate-500 mt-1">{formattedDate}</p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/seller/offers/new")}
          className="relative flex items-center justify-between rounded-3xl bg-white px-6 py-4 shadow-md min-w-[260px] hover:shadow-lg transition"
        >
          <span className="text-sm font-medium text-slate-900">Create Offer New</span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-white text-2xl">
            +
          </span>
        </button>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
          <div className="mb-4 h-6 w-32 animate-pulse rounded bg-slate-200" />
          <div className="space-y-3">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="h-10 w-full animate-pulse rounded bg-slate-100" />
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
        <section className="rounded-3xl bg-white shadow-md overflow-hidden border border-slate-200">
          <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900">Recent Offer</h3>
            <button
              type="button"
              onClick={() => navigate("/seller/offers")}
              className="text-sm font-medium text-amber-600 hover:underline"
            >
              View all Offers
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#F5F5F5] text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-6 md:px-8 py-3 text-left">Offer ID</th>
                  <th className="px-4 py-3 text-left">Product Name</th>
                  <th className="px-4 py-3 text-left">
                    Total Price
                    <span className="block text-[10px] font-normal text-slate-400">
                      (quantity x price)
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">Incoterm</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Delivery Time</th>
                  <th className="px-6 md:px-8 py-3 text-right" />
                </tr>
              </thead>
              <tbody className="bg-white">
                {recent.map((offer) => (
                  <tr
                    key={offer.id || offer.offer_id}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-[#FAFAFA]"
                  >
                    <td className="px-6 md:px-8 py-4 font-semibold text-slate-900">
                      {formatOfferId(offer)}
                    </td>
                    <td className="px-4 py-4 text-slate-800">
                      {offer.product_name || offer.productName}
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-900">
                      {formatTotalPrice(offer)}
                    </td>
                    <td className="px-4 py-4">{incotermBadge(offer.seller_incoterm || offer.incoterm)}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${statusStyle(
                          offer.status
                        )}`}
                      >
                        {(offer.status || "").replace(/_/g, " ") || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-800">
                      {formatDate(offer.cargo_ready_date || offer.delivery_time || offer.deliveryDate)}
                    </td>
                    <td className="px-6 md:px-8 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/seller/offers/${offer.id || offer.offer_id}`)}
                        className="text-xs font-medium text-amber-600 hover:underline"
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                ))}
                {recent.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 md:px-8 py-6 text-center text-sm text-slate-500"
                    >
                      You don’t have any offers yet. Create a new offer to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default SellerHome;
