import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiAlertCircle, FiArrowRight, FiRefreshCw, FiSearch, FiTag } from "react-icons/fi";
import { privateOfferApi } from "../../api/privateOffersApi";
import { getOfferById } from "../../api/offerApi";
import {
  destinationForServiceRequest,
  fetchProviderServiceRequestById,
} from "../../utils/providerServiceRequestUtils";

const normalizePrivateOffer = (item) => ({
  id: item?.id || "",
  offerId: item?.offer_id || "",
  serviceRequestId: item?.service_request_id || "",
  providerId: item?.provider_id || "",
  negotiatedPrice: item?.negotiated_price || "",
  updatedCrd: item?.updated_crd || null,
  updatedEtd: item?.updated_etd || null,
  sellerDocumentation: item?.seller_documentation || "",
  internalNotes: item?.internal_notes ?? "",
  status: item?.status || "",
  sellerConfirmationStatus:
    item?.seller_confirmation_status || item?.sellerConfirmationStatus || "PENDING",
  sellerConfirmedAt: item?.seller_confirmed_at || item?.sellerConfirmedAt || null,
  sellerConfirmedBy: item?.seller_confirmed_by || item?.sellerConfirmedBy || null,
  sellerConfirmationChannel:
    item?.seller_confirmation_channel || item?.sellerConfirmationChannel || null,
  sellerConfirmationNote: item?.seller_confirmation_note || item?.sellerConfirmationNote || null,
  createdAt: item?.created_at || "",
  updatedAt: item?.updated_at || "",
});

const formatDate = (value) => {
  if (!value) return "Not provided";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
};

const StatusBadge = ({ value }) => (
  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
    {value || "PRIVATE_OFFER_CREATED"}
  </span>
);

const SellerConfirmationBadge = ({ status }) => {
  const tone =
    status === "CONFIRMED"
      ? "emerald"
      : status === "REJECTED"
        ? "rose"
        : "amber";
  const label =
    status === "CONFIRMED"
      ? "Seller confirmed (offline)"
      : status === "REJECTED"
        ? "Seller rejected (offline)"
        : "Seller confirmation: Pending";
  const bgClass =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : tone === "rose"
        ? "bg-rose-50 text-rose-700 border-rose-100"
        : "bg-amber-50 text-amber-800 border-amber-100";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${bgClass}`}
    >
      {label}
    </span>
  );
};

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 8 }).map((_, idx) => (
      <td key={idx} className="px-3 py-3">
        <div className="h-4 w-28 rounded bg-slate-200" />
      </td>
    ))}
    <td className="px-3 py-3">
      <div className="h-9 w-28 rounded bg-slate-200" />
    </td>
  </tr>
);

const ProviderPrivateOffersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [offers, setOffers] = useState([]);
  const [offerMap, setOfferMap] = useState({});
  const [serviceRequestMap, setServiceRequestMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [flashMessage, setFlashMessage] = useState(location.state?.successMessage || "");

  useEffect(() => {
    if (location.state?.successMessage) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    let authError = "";
    try {
      const res = await privateOfferApi.getMyPrivateOffers();
      const payload = res?.data ?? res;
      const list = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];
      const normalized = list.map(normalizePrivateOffer);

      const uniqueOfferIds = [...new Set(normalized.map((i) => i.offerId).filter(Boolean))];
      const uniqueSrIds = [
        ...new Set(normalized.map((i) => i.serviceRequestId).filter(Boolean)),
      ];
      const srOfferLookup = {};
      normalized.forEach((item) => {
        if (item.serviceRequestId && item.offerId) {
          srOfferLookup[item.serviceRequestId] = item.offerId;
        }
      });

      const offerDetails = {};
      await Promise.all(
        uniqueOfferIds.map(async (offerId) => {
          try {
            const detail = await getOfferById(offerId);
            offerDetails[offerId] = detail?.data ?? detail;
          } catch (err) {
            offerDetails[offerId] = null;
          }
        })
      );

      const srDetails = {};
      await Promise.all(
        uniqueSrIds.map(async (srId) => {
          try {
            const detail = await fetchProviderServiceRequestById({
              serviceRequestId: srId,
              offerId: srOfferLookup[srId],
              limit: 200,
              offset: 0,
            });
            srDetails[srId] = detail || null;
          } catch (err) {
            if (!authError && (err?.response?.status === 401 || err?.response?.status === 403)) {
              authError = "You are not allowed";
            }
            srDetails[srId] = null;
          }
        })
      );

      setOfferMap(offerDetails);
      setServiceRequestMap(srDetails);
      setOffers(normalized);
    } catch (err) {
      const status = err?.response?.status;
      const msg =
        status === 401 || status === 403
          ? "You are not allowed"
          : err?.response?.data?.detail ||
            err?.message ||
            "Could not load private offers for this provider.";
      setError(authError || msg);
      setOffers([]);
      setOfferMap({});
      setServiceRequestMap({});
      return;
    } finally {
      setLoading(false);
    }

    if (authError) {
      setError(authError);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const rows = useMemo(
    () =>
      offers.map((item) => ({
        ...item,
        offer: item.offerId ? offerMap[item.offerId] : null,
        serviceRequest: item.serviceRequestId ? serviceRequestMap[item.serviceRequestId] : null,
      })),
    [offers, offerMap, serviceRequestMap]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((item) => {
      const haystack = [
        item.id,
        item.offerId,
        item.serviceRequestId,
        item.offer?.product_name,
        item.offer?.id,
        item.serviceRequest?.contactName,
        item.serviceRequest?.contactEmail,
        item.serviceRequest?.note,
      ]
        .filter(Boolean)
        .map((v) => v.toString().toLowerCase())
        .join(" ");
      return haystack.includes(term);
    });
  }, [rows, search]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-900">My Private Offers</h1>
        <p className="text-sm text-slate-600">
          These are the private offers you created in response to buyer service requests.
        </p>
      </div>

      {flashMessage ? (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <div className="flex items-start gap-2">
            <FiTag className="h-4 w-4 mt-0.5" />
            <div>
              <p className="font-semibold">Success</p>
              <p className="text-xs text-emerald-700">{flashMessage}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFlashMessage("")}
            className="text-xs font-semibold text-emerald-800 underline"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Private Offer ID, Offer, or Buyer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-10 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-200 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchData}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
          >
            <FiRefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => navigate("/provider/service-requests")}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Respond to Service Requests
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Private Offers</h2>
            <p className="text-sm text-slate-600">
              Filter and open any offer to review the terms you proposed.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-600">
            <FiTag className="h-4 w-4" />
            {filtered.length} shown
          </div>
        </div>

        {loading ? (
          <div className="overflow-hidden border-t border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3 text-left">Private Offer</th>
                  <th className="px-3 py-3 text-left">Offer / Product</th>
                  <th className="px-3 py-3 text-left">Service Request</th>
                  <th className="px-3 py-3 text-left">Price</th>
                  <th className="px-3 py-3 text-left">Dates</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-left">Seller Confirmation</th>
                  <th className="px-3 py-3 text-left">Created</th>
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
              <p className="font-semibold">Could not load private offers.</p>
              <p className="text-xs text-rose-600">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchData}
              className="text-xs font-semibold text-rose-800 underline"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="border-t border-dashed border-slate-200 px-6 py-10 text-center">
            <p className="text-lg font-semibold text-slate-900 mb-2">
              You have not created any private offers yet.
            </p>
            <p className="text-sm text-slate-600 mb-4">
              Once you respond to buyer requests, they will appear here.
            </p>
            <button
              type="button"
              onClick={() => navigate("/provider/service-requests")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Go to Service Requests
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto border-t border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3 text-left">Private Offer</th>
                  <th className="px-3 py-3 text-left">Offer / Product</th>
                  <th className="px-3 py-3 text-left">Service Request</th>
                  <th className="px-3 py-3 text-left">Price</th>
                  <th className="px-3 py-3 text-left">Dates</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-left">Seller Confirmation</th>
                  <th className="px-3 py-3 text-left">Created</th>
                  <th className="px-3 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const offerLabel =
                    item.offer?.product_name || item.offerId || "Offer not found";
                  const srLabel = item.serviceRequestId ? `#SR-${item.serviceRequestId}` : "N/A";
                  const buyerLabel =
                    item.serviceRequest?.contactName ||
                    item.serviceRequest?.contactEmail ||
                    "";
                  const dates = [item.updatedCrd, item.updatedEtd].filter(Boolean).join(" / ");
                  const created = formatDate(item.createdAt);

                  return (
                    <tr
                      key={item.id || `${item.offerId}-${item.serviceRequestId}`}
                      className="hover:bg-slate-50 transition"
                    >
                      <td className="px-3 py-3 font-semibold text-slate-900">
                        {item.id ? `#PO-${item.id}` : "Private Offer"}
                        <div className="text-xs text-slate-500">{buyerLabel}</div>
                      </td>
                      <td className="px-3 py-3 text-slate-800">
                        <div className="flex flex-col">
                          <span className="font-semibold">{offerLabel}</span>
                          {item.offer?.seller_incoterm && (
                            <span className="text-xs text-slate-500">
                              Seller incoterm: {item.offer.seller_incoterm}
                            </span>
                          )}
                        </div>
                      </td>
                  <td className="px-3 py-3 text-slate-800">
                    <div className="flex flex-col">
                      <span className="font-semibold">{srLabel}</span>
                      {item.serviceRequest?.incotermBuyer && (
                        <span className="text-xs text-slate-500">
                          Buyer incoterm: {item.serviceRequest.incotermBuyer}
                        </span>
                      )}
                      <span className="text-xs text-slate-500">
                        {destinationForServiceRequest(item.serviceRequest)}
                      </span>
                    </div>
                  </td>
                      <td className="px-3 py-3 text-slate-800">
                        {item.negotiatedPrice || "Not provided"}
                      </td>
                      <td className="px-3 py-3 text-slate-700">{dates || "Not provided"}</td>
                      <td className="px-3 py-3">
                        <StatusBadge value={item.status} />
                      </td>
                      <td className="px-3 py-3">
                        <SellerConfirmationBadge status={item.sellerConfirmationStatus} />
                      </td>
                      <td className="px-3 py-3 text-slate-600">{created}</td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => item.id && navigate(`/provider/private-offers/${item.id}`)}
                          disabled={!item.id}
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                            item.id
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

export default ProviderPrivateOffersPage;
