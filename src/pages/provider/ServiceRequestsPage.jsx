import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle, FiArrowRight, FiRefreshCw, FiSearch } from "react-icons/fi";
import { getOfferById } from "../../api/offerApi";
import { fetchMyPrivateOffers } from "../../api/privateOffersApi";
import { getMyProposals } from "../../api/proposalsApi";
import { getServiceRequestById } from "../../api/serviceRequestsApi";

const normalizePrivateOffer = (item) => ({
  id: item?.id || "",
  serviceRequestId: item?.service_request_id || "",
  offerId: item?.offer_id || "",
});

const normalizeProposal = (item) => ({
  id: item?.id || "",
  serviceRequestId: item?.service_request_id || "",
  offerId: item?.offer_id || "",
  status: item?.status || "",
});

const normalizeServiceRequest = (item) => ({
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
  createdAt: item?.created_at || "",
  updatedAt: item?.updated_at || "",
});

const formatDate = (value) => {
  if (!value) return "Not provided";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
};

const StatusPill = ({ label }) => (
  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
    {label || "REQUESTED"}
  </span>
);

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 7 }).map((_, idx) => (
      <td key={idx} className="px-3 py-3">
        <div className="h-4 w-28 rounded bg-slate-200" />
      </td>
    ))}
    <td className="px-3 py-3">
      <div className="h-9 w-28 rounded bg-slate-200" />
    </td>
  </tr>
);

const getDestination = (req) => {
  const incoterm = (req.incotermBuyer || "").toUpperCase();
  if (incoterm === "CFR" || incoterm === "CIF") {
    return req.portOfDischarge || req.countryCode || "Not provided";
  }
  return req.warehouseAddress || req.warehouseCode || req.countryCode || "Not provided";
};

const ServiceRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [offers, setOffers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const [poRes, proposalRes] = await Promise.all([fetchMyPrivateOffers(), getMyProposals()]);
      const poPayload = poRes?.data ?? poRes ?? [];
      const proposalsPayload = proposalRes?.data ?? proposalRes ?? [];

      const privateOffers = (Array.isArray(poPayload?.data) ? poPayload.data : poPayload).map(
        normalizePrivateOffer
      );
      const proposals = (Array.isArray(proposalsPayload?.data) ? proposalsPayload.data : proposalsPayload).map(
        normalizeProposal
      );

      const srIds = [
        ...new Set(
          [...privateOffers, ...proposals]
            .map((item) => item.serviceRequestId)
            .filter(Boolean)
        ),
      ];

      if (srIds.length === 0) {
        setRequests([]);
        setOffers({});
        return;
      }

      const srMap = {};
      await Promise.all(
        srIds.map(async (srId) => {
          try {
            const srRes = await getServiceRequestById(srId);
            srMap[srId] = normalizeServiceRequest(srRes);
          } catch (err) {
            srMap[srId] = null;
          }
        })
      );

      const offerIds = [
        ...new Set(
          Object.values(srMap)
            .filter(Boolean)
            .map((sr) => sr.offerId)
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

      const rows = srIds
        .map((srId) => {
          const sr = srMap[srId];
          if (!sr) return null;
          const relatedPrivateOffers = privateOffers.filter((item) => item.serviceRequestId === srId);
          const relatedProposals = proposals.filter((item) => item.serviceRequestId === srId);
          return {
            ...sr,
            offer: sr.offerId ? offerMap[sr.offerId] : null,
            privateOffer: relatedPrivateOffers[0] || null,
            proposal: relatedProposals[0] || null,
          };
        })
        .filter(Boolean);

      setRequests(rows);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Could not load service requests for this provider.";
      setError(msg);
      setRequests([]);
      setOffers({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const rows = useMemo(
    () => requests.map((item) => ({ ...item, offer: item.offerId ? offers[item.offerId] : item.offer })),
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
        item.offer?.id,
        item.contactName,
        item.contactEmail,
        item.note,
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
        <h1 className="text-3xl font-bold text-slate-900">Service Requests</h1>
        <p className="text-sm text-slate-600">Review buyer requests linked to your private offers and proposals.</p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, Offer, or Buyer..."
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
            These requests come from buyers and are tied to your offers, proposals, or private offers.
          </p>
        </div>

        {loading ? (
          <div className="overflow-hidden border-t border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3 text-left">Service Request</th>
                  <th className="px-3 py-3 text-left">Offer / Product</th>
                  <th className="px-3 py-3 text-left">Buyer Contact</th>
                  <th className="px-3 py-3 text-left">Incoterm (Buyer)</th>
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
              Once your private offers or proposals relate to buyer requests, they will show up here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border-t border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3 text-left">Service Request</th>
                  <th className="px-3 py-3 text-left">Offer / Product</th>
                  <th className="px-3 py-3 text-left">Buyer Contact</th>
                  <th className="px-3 py-3 text-left">Incoterm (Buyer)</th>
                  <th className="px-3 py-3 text-left">Destination</th>
                  <th className="px-3 py-3 text-left">Created</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((req) => {
                  const srLabel = req.id ? `#SR-${req.id}` : "Service Request";
                  const offerLabel = req.offer?.product_name || req.offerId || "Offer";
                  const buyerLabel = req.contactName || req.contactEmail || req.buyerId || "Unknown";
                  const destination = getDestination(req);

                  return (
                    <tr key={req.id || `${req.offerId}-${req.buyerId}`} className="hover:bg-slate-50 transition">
                      <td className="px-3 py-3 font-semibold text-slate-900">{srLabel}</td>
                      <td className="px-3 py-3 text-slate-800">
                        <div className="flex flex-col">
                          <span className="font-semibold">{offerLabel}</span>
                          {req.offer?.port_of_loading && (
                            <span className="text-xs text-slate-500">Port: {req.offer.port_of_loading}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-700">{buyerLabel}</td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {(req.incotermBuyer || "").toString().toUpperCase() || "N/A"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-700">{destination}</td>
                      <td className="px-3 py-3 text-slate-600">{formatDate(req.createdAt)}</td>
                      <td className="px-3 py-3">
                        <StatusPill label={req.status} />
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => req.id && navigate(`/provider/service-requests/${req.id}`)}
                          disabled={!req.id}
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                            req.id
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
