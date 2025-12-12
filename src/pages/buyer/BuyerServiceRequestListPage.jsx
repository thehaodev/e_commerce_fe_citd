import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiClock,
  FiCheckCircle,
  FiGlobe,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";
import { getOfferById } from "../../api/offerApi";
import { getMyServiceRequests } from "../../api/serviceRequestsApi";

const normalizeRequest = (item) => ({
  id: item?.id || "",
  offerId: item?.offer_id || "",
  buyerId: item?.buyer_id || "",
  incotermBuyer: item?.incoterm_buyer || "",
  note: item?.note || "",
  status: item?.status || "",
  portOfDischarge: item?.port_of_discharge || "",
  countryCode: item?.country_code || "",
  insuranceType: item?.insurance_type || "",
  warehouseAddress: item?.warehouse_address || "",
  warehouseCode: item?.warehouse_code || "",
  contactName: item?.contact_name || "",
  contactEmail: item?.contact_email || "",
  contactPhone: item?.contact_phone || "",
  createdAt: item?.created_at || "",
});

const destinationFor = (req) => {
  const incoterm = (req?.incotermBuyer || "").toUpperCase();
  if (incoterm === "CFR" || incoterm === "CIF") {
    return req?.portOfDischarge || req?.countryCode || "Not provided";
  }
  return req?.warehouseAddress || req?.warehouseCode || req?.countryCode || "Not provided";
};

const formatDate = (value) => {
  if (!value) return "Not provided";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
};

const BuyerServiceRequestListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.success;
  const [flashMessage, setFlashMessage] = useState(successMessage || "");

  const [requests, setRequests] = useState([]);
  const [offers, setOffers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyServiceRequests();
      const payload = res?.data ?? res ?? [];
      const normalized = (Array.isArray(payload?.data) ? payload.data : payload).map(normalizeRequest);
      setRequests(normalized);

      const offerIds = [
        ...new Set(
          normalized
            .map((item) => item.offerId)
            .filter(Boolean)
        ),
      ];
      const offerMap = {};
      await Promise.all(
        offerIds.map(async (offerId) => {
          try {
            const offerRes = await getOfferById(offerId);
            offerMap[offerId] = offerRes?.data ?? offerRes;
          } catch (err) {
            offerMap[offerId] = null;
          }
        })
      );
      setOffers(offerMap);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Could not load your service requests.";
      setError(msg);
      setRequests([]);
      setOffers({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (successMessage) {
      setFlashMessage(successMessage);
      navigate(location.pathname, { replace: true, state: {} });
    }
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(
    () => requests.map((item) => ({ ...item, offer: item.offerId ? offers[item.offerId] : null })),
    [requests, offers]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((item) => {
      const haystack = [
        item.id,
        item.offerId,
        item.offer?.product_name,
        item.offer?.port_of_loading,
        item.incotermBuyer,
        item.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [rows, search]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/buyer/home")}
            className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-amber-800 shadow-sm hover:border-amber-300"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to Buyer Home
          </button>
          <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            My Service Requests
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate("/buyer/service-requests/new")}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
        >
          <FiGlobe className="h-4 w-4" />
          New Service Request
        </button>
      </div>

      {flashMessage && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <FiCheckCircle className="h-4 w-4 mt-0.5" />
          <span>{flashMessage}</span>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-amber-100 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
          <input
            type="text"
            placeholder="Search by product, offer, or incoterm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-amber-100 bg-amber-50/60 px-10 py-2 text-sm text-gray-800 placeholder:text-amber-400 focus:border-amber-200 focus:ring-2 focus:ring-amber-100"
          />
        </div>
        <button
          type="button"
          onClick={fetchRequests}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-100 bg-white px-4 py-2 text-sm font-semibold text-amber-800 transition hover:border-amber-200"
        >
          <FiRefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-amber-100 bg-white shadow-sm">
        <div className="px-4 py-4">
          <h2 className="text-lg font-bold text-gray-900">Your requests</h2>
          <p className="text-sm text-gray-600">
            Track service requests and jump to details or the related offers.
          </p>
        </div>

        {loading ? (
          <div className="border-t border-amber-50">
            <table className="w-full text-sm">
              <thead className="bg-amber-50 text-xs font-semibold uppercase tracking-wide text-amber-700">
                <tr>
                  <th className="px-3 py-3 text-left">Request</th>
                  <th className="px-3 py-3 text-left">Offer</th>
                  <th className="px-3 py-3 text-left">Incoterm</th>
                  <th className="px-3 py-3 text-left">Destination</th>
                  <th className="px-3 py-3 text-left">Created</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    {Array.from({ length: 7 }).map((__, cellIdx) => (
                      <td key={cellIdx} className="px-3 py-3">
                        <div className="h-4 w-24 rounded bg-amber-100" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : error ? (
          <div className="flex items-start gap-2 border-t border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <FiAlertCircle className="mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Could not load service requests.</p>
              <p className="text-xs text-rose-600">{error}</p>
              <button
                type="button"
                onClick={fetchRequests}
                className="text-xs font-semibold text-rose-800 underline"
              >
                Retry
              </button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="border-t border-dashed border-amber-100 px-6 py-10 text-center">
            <p className="text-lg font-semibold text-gray-900 mb-2">No service requests yet.</p>
            <p className="text-sm text-gray-600">
              Express interest in an offer to unlock service requests with providers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border-t border-amber-50">
            <table className="w-full text-sm">
              <thead className="bg-amber-50 text-xs font-semibold uppercase tracking-wide text-amber-700">
                <tr>
                  <th className="px-3 py-3 text-left">Request</th>
                  <th className="px-3 py-3 text-left">Offer</th>
                  <th className="px-3 py-3 text-left">Incoterm</th>
                  <th className="px-3 py-3 text-left">Destination</th>
                  <th className="px-3 py-3 text-left">Created</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-amber-50/70 transition">
                    <td className="px-3 py-3 font-semibold text-gray-900">
                      {req.id ? `#SR-${req.id}` : "Service Request"}
                    </td>
                    <td className="px-3 py-3 text-gray-800">
                      <div className="flex flex-col">
                        <span className="font-semibold">{req.offer?.product_name || req.offerId}</span>
                        {req.offer?.port_of_loading && (
                          <span className="text-xs text-gray-500">
                            Port: {req.offer.port_of_loading}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        {(req.incotermBuyer || "").toString().toUpperCase() || "N/A"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-700">{destinationFor(req)}</td>
                    <td className="px-3 py-3 text-gray-600">
                      <div className="flex items-center gap-1">
                        <FiClock className="h-4 w-4 text-amber-500" />
                        {formatDate(req.createdAt)}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {req.status || "REQUESTED"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/buyer/service-requests/${req.id}`)}
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600"
                        >
                          View details
                          <FiArrowRight className="h-4 w-4" />
                        </button>
                        {req.offerId && (
                          <button
                            type="button"
                            onClick={() => navigate(`/buyer/offers/${req.offerId}`)}
                            className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-800 transition hover:border-amber-300"
                          >
                            Offer
                            <FiArrowRight className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerServiceRequestListPage;
