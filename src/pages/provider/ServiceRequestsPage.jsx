import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle, FiArrowRight, FiRefreshCw, FiSearch } from "react-icons/fi";
import { getProviderServiceRequests } from "../../api/providerApi";

const normalizeServiceRequest = (item) => {
  const data = item || {};
  const offer = data.offer || data.offer_detail || data.offerDetail || {};
  const buyer = data.buyer || {};

  const id =
    data.id || data.service_request_id || data.serviceRequestId || data.service_request_uuid;
  const offerCode = data.offer_code || data.offerCode || offer.offer_code || offer.code;
  const offerTitle =
    data.offer_title || data.offerTitle || offer.product_name || offer.title || "Offer";
  const buyerName =
    data.buyer_name ||
    data.buyerName ||
    buyer.company_name ||
    buyer.full_name ||
    buyer.name ||
    data.buyer_company ||
    "Buyer";
  const incoterm =
    (data.incoterm_buyer ||
      data.incotermBuyer ||
      data.buyer_incoterm ||
      data.incoterm ||
      data.incoterm_buyer_code ||
      "")?.toString()?.toUpperCase() || "—";
  const destination =
    data.port_of_discharge ||
    data.destination ||
    data.delivery_location ||
    data.warehouse ||
    data.port ||
    data.buyer_destination ||
    data.destination_port ||
    "—";
  const createdAt = data.created_at || data.createdAt || data.created_date;
  const status =
    (data.status || "")
      .toString()
      .replace(/_/g, " ")
      .trim() || "REQUESTED";

  return {
    id,
    offerCode,
    offerTitle,
    buyerName,
    incotermBuyer: incoterm,
    destination,
    createdAt,
    status,
  };
};

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
};

const StatusPill = ({ label }) => (
  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
    {label}
  </span>
);

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 6 }).map((_, idx) => (
      <td key={idx} className="px-3 py-3">
        <div className="h-4 w-28 rounded bg-slate-200" />
      </td>
    ))}
    <td className="px-3 py-3">
      <div className="h-9 w-28 rounded bg-slate-200" />
    </td>
  </tr>
);

const ServiceRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getProviderServiceRequests();
      const payload = res?.data ?? res;
      const list = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload)
            ? payload
            : [];
      setRequests(list.map(normalizeServiceRequest));
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Could not load service requests for this provider.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return requests;
    return requests.filter((item) => {
      const haystack = [
        item.offerCode,
        item.offerTitle,
        item.buyerName,
        item.incotermBuyer,
        item.destination,
      ]
        .filter(Boolean)
        .map((v) => v.toString().toLowerCase())
        .join(" ");
      return haystack.includes(term);
    });
  }, [requests, search]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-900">Service Requests</h1>
        <p className="text-sm text-slate-600">
          Review buyer logistics requests and kick off private offer flows.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Offer code, Buyer, or Incoterm…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-10 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-200 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <button
          type="button"
          onClick={fetchRequests}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
        >
          <FiRefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="px-4 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Visible to you</h2>
          <p className="text-sm text-slate-600">
            These requests are ready for private offers. Open one to review details.
          </p>
        </div>

        {loading ? (
          <div className="overflow-hidden border-t border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3 text-left">Offer</th>
                  <th className="px-3 py-3 text-left">Buyer</th>
                  <th className="px-3 py-3 text-left">Incoterm</th>
                  <th className="px-3 py-3 text-left">Destination</th>
                  <th className="px-3 py-3 text-left">Created</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <SkeletonRow key={idx} />
                ))}
              </tbody>
            </table>
          </div>
        ) : error ? (
          <div className="border-t border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-start gap-2">
            <FiAlertCircle className="mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Could not load service requests.</p>
              <p className="text-xs text-rose-600">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchRequests}
              className="text-xs font-semibold text-rose-800 underline"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="border-t border-dashed border-slate-200 px-6 py-10 text-center">
            <p className="text-lg font-semibold text-slate-900 mb-2">No service requests yet.</p>
            <p className="text-sm text-slate-600">
              Once buyers send requests, you&apos;ll see them here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border-t border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3 text-left">Offer</th>
                  <th className="px-3 py-3 text-left">Buyer</th>
                  <th className="px-3 py-3 text-left">Incoterm</th>
                  <th className="px-3 py-3 text-left">Destination</th>
                  <th className="px-3 py-3 text-left">Created</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((req) => {
                  const label = req.offerCode || req.offerTitle || "Service Request";
                  const hasId = Boolean(req.id);
                  return (
                    <tr
                      key={req.id || `${req.offerCode}-${req.buyerName}`}
                      className="hover:bg-slate-50 transition"
                    >
                      <td className="px-3 py-3 font-semibold text-slate-900">
                        <div className="flex flex-col">
                          <span>{label}</span>
                          {req.offerTitle && req.offerCode && (
                            <span className="text-xs text-slate-500">{req.offerTitle}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-700">{req.buyerName}</td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {req.incotermBuyer}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-700">{req.destination}</td>
                      <td className="px-3 py-3 text-slate-600">{formatDate(req.createdAt)}</td>
                      <td className="px-3 py-3">
                        <StatusPill label={req.status} />
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => hasId && navigate(`/provider/service-requests/${req.id}`)}
                          disabled={!hasId}
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                            hasId
                              ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600"
                              : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          View details
                          <FiArrowRight className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceRequestsPage;
