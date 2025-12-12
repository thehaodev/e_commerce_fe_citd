import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle, FiArrowRight, FiRefreshCw, FiSearch } from "react-icons/fi";
import { getMyProposals } from "../../api/proposalsApi";
import { getServiceRequestById } from "../../api/serviceRequestsApi";
import { getOfferById } from "../../api/offerApi";
import { getPrivateOfferById } from "../../api/privateOffersApi";

const statusStyles = {
  AWARDED: "bg-emerald-100 text-emerald-700",
  PROPOSAL_SENT: "bg-amber-100 text-amber-700",
  REJECTED: "bg-rose-100 text-rose-700",
  EXPIRED: "bg-slate-200 text-slate-700",
  WITHDRAWN: "bg-slate-200 text-slate-700",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
      statusStyles[status] || "bg-slate-100 text-slate-700"
    }`}
  >
    {status}
  </span>
);

const normalizeProposal = (item) => ({
  id: item?.id || "",
  privateOfferId: item?.private_offer_id || "",
  offerId: item?.offer_id || "",
  serviceRequestId: item?.service_request_id || "",
  status: item?.status || "",
  serviceFee: item?.service_fee ?? null,
  totalCost: item?.total_cost ?? null,
  leadTime: item?.lead_time ?? null,
  eta: item?.eta || null,
  createdAt: item?.created_at || "",
});

const normalizeServiceRequest = (item) => ({
  id: item?.id || "",
  offerId: item?.offer_id || "",
  incotermBuyer: item?.incoterm_buyer || "",
  destination:
    item?.port_of_discharge ||
    item?.warehouse_address ||
    item?.warehouse_code ||
    item?.country_code ||
    "",
});

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

const ProviderProposalsPage = () => {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [privateOfferMap, setPrivateOfferMap] = useState({});
  const [serviceRequestMap, setServiceRequestMap] = useState({});
  const [offerMap, setOfferMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyProposals();
      const raw = res?.data ?? res ?? [];
      const list = (Array.isArray(raw?.data) ? raw.data : raw).map(normalizeProposal);
      setProposals(list);

      const privateOfferIds = [...new Set(list.map((p) => p.privateOfferId).filter(Boolean))];
      const srIds = [...new Set(list.map((p) => p.serviceRequestId).filter(Boolean))];
      const offerIds = new Set(list.map((p) => p.offerId).filter(Boolean));

      const poMap = {};
      await Promise.all(
        privateOfferIds.map(async (poId) => {
          try {
            const poRes = await getPrivateOfferById(poId);
            poMap[poId] = poRes?.data ?? poRes;
          } catch (err) {
            poMap[poId] = null;
          }
        })
      );
      setPrivateOfferMap(poMap);

      const srMap = {};
      await Promise.all(
        srIds.map(async (srId) => {
          try {
            const srRes = await getServiceRequestById(srId);
            srMap[srId] = normalizeServiceRequest(srRes);
            if (srRes?.offer_id) {
              offerIds.add(srRes.offer_id);
            }
          } catch (err) {
            srMap[srId] = null;
          }
        })
      );
      setServiceRequestMap(srMap);

      const oMap = {};
      await Promise.all(
        [...offerIds].map(async (offerId) => {
          try {
            const offerRes = await getOfferById(offerId);
            oMap[offerId] = offerRes?.data ?? offerRes;
          } catch (err) {
            oMap[offerId] = null;
          }
        })
      );
      setOfferMap(oMap);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to load proposals for this provider.";
      setError(msg);
      setProposals([]);
      setPrivateOfferMap({});
      setServiceRequestMap({});
      setOfferMap({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return proposals.filter((proposal) => {
      if (statusFilter !== "ALL" && proposal.status !== statusFilter) {
        return false;
      }
      if (!term) return true;
      const haystack = [
        proposal.id,
        proposal.offerId,
        proposal.serviceRequestId,
        offerMap[proposal.offerId]?.product_name,
        serviceRequestMap[proposal.serviceRequestId]?.destination,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [proposals, statusFilter, search, offerMap, serviceRequestMap]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-900">My Proposals</h1>
        <p className="text-sm text-slate-600">Proposals you have submitted from private offers.</p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "PROPOSAL_SENT", "AWARDED", "REJECTED", "EXPIRED", "WITHDRAWN"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold border ${
                statusFilter === status
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              {status === "ALL" ? "All" : status.replace("_", " ")}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search proposals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-10 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-200 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <button
            type="button"
            onClick={fetchData}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
          >
            <FiRefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="px-4 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Proposals</h2>
          <p className="text-sm text-slate-600">Open a proposal to view details or withdraw if needed.</p>
        </div>

        {loading ? (
          <div className="overflow-hidden border-t border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3 text-left">Proposal</th>
                  <th className="px-3 py-3 text-left">Private Offer</th>
                  <th className="px-3 py-3 text-left">Service Request</th>
                  <th className="px-3 py-3 text-left">Offer</th>
                  <th className="px-3 py-3 text-left">Fees</th>
                  <th className="px-3 py-3 text-left">Status</th>
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
              <p className="font-semibold">Could not load proposals.</p>
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
            <p className="text-lg font-semibold text-slate-900 mb-2">No proposals yet.</p>
            <p className="text-sm text-slate-600">
              Create a private offer and send a proposal to see it here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border-t border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3 text-left">Proposal</th>
                  <th className="px-3 py-3 text-left">Private Offer</th>
                  <th className="px-3 py-3 text-left">Service Request</th>
                  <th className="px-3 py-3 text-left">Offer</th>
                  <th className="px-3 py-3 text-left">Fees</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-left">Created</th>
                  <th className="px-3 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((proposal) => {
                  const privateOffer = privateOfferMap[proposal.privateOfferId];
                  const serviceRequest = serviceRequestMap[proposal.serviceRequestId];
                  const offer = offerMap[proposal.offerId];
                  return (
                    <tr key={proposal.id} className="hover:bg-slate-50 transition">
                      <td className="px-3 py-3 font-semibold text-slate-900">
                        {proposal.id ? `#PP-${proposal.id}` : "Proposal"}
                        <div className="text-xs text-slate-500">{proposal.serviceRequestId && `SR #${proposal.serviceRequestId}`}</div>
                      </td>
                      <td className="px-3 py-3 text-slate-800">
                        {proposal.privateOfferId || "N/A"}
                        {privateOffer?.negotiated_price && (
                          <div className="text-xs text-slate-500">Price: {privateOffer.negotiated_price}</div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-slate-800">
                        {serviceRequest?.incotermBuyer || serviceRequest?.incoterm_buyer || "N/A"}
                        <div className="text-xs text-slate-500">
                          {serviceRequest?.destination || "Destination not provided"}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-800">
                        <div className="flex flex-col">
                          <span className="font-semibold">
                            {offer?.product_name || proposal.offerId || "Offer"}
                          </span>
                          {offer?.seller_incoterm && (
                            <span className="text-xs text-slate-500">Incoterm: {offer.seller_incoterm}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-800">
                        <div className="flex flex-col">
                          <span>Fee: {proposal.serviceFee ?? "N/A"}</span>
                          <span>Total: {proposal.totalCost ?? "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={proposal.status} />
                      </td>
                      <td className="px-3 py-3 text-slate-600">{proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString() : "N/A"}</td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => navigate(`/provider/proposals/${proposal.id}`)}
                          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition bg-emerald-500 text-white shadow-sm hover:bg-emerald-600"
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

export default ProviderProposalsPage;
