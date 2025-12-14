import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowRight,
  FiExternalLink,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";
import { getMyServiceRequests } from "../../api/serviceRequestsApi";
import { proposalApi } from "../../api/proposalsApi";

const normalizeServiceRequest = (item) => ({
  id: item?.id || "",
  offerId: item?.offer_id || "",
  incotermBuyer: item?.incoterm_buyer || item?.incotermBuyer || "",
  status: item?.status || "",
  createdAt: item?.created_at || "",
});

const normalizeProposal = (item) => ({
  id: item?.id || "",
  offerId: item?.offer_id || "",
  serviceRequestId: item?.service_request_id || "",
  status: item?.status || "",
  serviceFee: item?.service_fee ?? null,
  totalCost: item?.total_cost ?? null,
  extraCharges: item?.extra_charges ?? null,
  leadTime: item?.lead_time ?? null,
  eta: item?.eta || "",
  createdAt: item?.created_at || "",
});

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
    {status || "UNKNOWN"}
  </span>
);

const formatDate = (value) => {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
};

const SkeletonTable = () => (
  <div className="overflow-hidden border-t border-amber-50">
    <table className="w-full text-sm">
      <thead className="bg-amber-50 text-xs font-semibold uppercase tracking-wide text-amber-700">
        <tr>
          <th className="px-3 py-3 text-left">Proposal</th>
          <th className="px-3 py-3 text-left">Fees</th>
          <th className="px-3 py-3 text-left">Lead / ETA</th>
          <th className="px-3 py-3 text-left">Service Request</th>
          <th className="px-3 py-3 text-left">Offer</th>
          <th className="px-3 py-3 text-left">Status</th>
          <th className="px-3 py-3 text-left">Created</th>
          <th className="px-3 py-3 text-left">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-amber-50">
        {Array.from({ length: 4 }).map((_, idx) => (
          <tr key={idx} className="animate-pulse">
            {Array.from({ length: 8 }).map((__, cellIdx) => (
              <td key={cellIdx} className="px-3 py-3">
                <div className="h-4 w-28 rounded bg-amber-100" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const BATCH_SIZE = 10;
const MAX_CONCURRENCY = 3;

const BuyerMyProposalsPage = () => {
  const navigate = useNavigate();
  const [serviceRequests, setServiceRequests] = useState([]);
  const [offerIds, setOfferIds] = useState([]);
  const [offerCursor, setOfferCursor] = useState(0);
  const [proposals, setProposals] = useState([]);
  const [loadingSrs, setLoadingSrs] = useState(true);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [search, setSearch] = useState("");

  const srMap = useMemo(() => {
    const map = {};
    serviceRequests.forEach((sr) => {
      if (sr.id) map[sr.id] = sr;
    });
    return map;
  }, [serviceRequests]);

  const srIdSet = useMemo(() => new Set(serviceRequests.map((sr) => String(sr.id))), [serviceRequests]);

  const awardedByOffer = useMemo(() => {
    const map = {};
    proposals.forEach((p) => {
      if (p.offerId && p.status === "AWARDED") {
        map[p.offerId] = p.id;
      }
    });
    return map;
  }, [proposals]);

  const loadServiceRequests = useCallback(async () => {
    setLoadingSrs(true);
    setError("");
    setActionError("");
    setProposals([]);
    setOfferIds([]);
    setOfferCursor(0);
    try {
      const res = await getMyServiceRequests();
      const payload = res?.data ?? res ?? [];
      const list = (Array.isArray(payload?.data) ? payload.data : payload).map(normalizeServiceRequest);
      setServiceRequests(list);
      const uniqueOffers = [...new Set(list.map((sr) => sr.offerId).filter(Boolean))];
      setOfferIds(uniqueOffers);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to load your service requests.";
      setError(msg);
      setServiceRequests([]);
    } finally {
      setLoadingSrs(false);
    }
  }, []);

  const fetchProposalsForBatch = useCallback(
    async (batch) => {
      const collected = [];
      for (let i = 0; i < batch.length; i += MAX_CONCURRENCY) {
        const group = batch.slice(i, i + MAX_CONCURRENCY);
        const groupResults = await Promise.all(
          group.map(async (offerId) => {
            try {
              const res = await proposalApi.listProposalsForOffer(offerId);
              const raw = res?.data ?? res ?? [];
              const list = (Array.isArray(raw?.data) ? raw.data : raw)
                .map(normalizeProposal)
                .filter((p) => srIdSet.has(String(p.serviceRequestId)));
              return { offerId, proposals: list, error: null };
            } catch (err) {
              const msg =
                err?.response?.data?.detail ||
                err?.message ||
                `Unable to load proposals for offer ${offerId}.`;
              return { offerId, proposals: [], error: msg };
            }
          })
        );
        collected.push(...groupResults);
      }
      return collected;
    },
    [srIdSet]
  );

  const loadNextBatch = useCallback(async () => {
    if (loadingBatch) return;
    const slice = offerIds.slice(offerCursor, offerCursor + BATCH_SIZE);
    if (!slice.length) return;
    setLoadingBatch(true);
    setActionError("");
    try {
      const results = await fetchProposalsForBatch(slice);
      const merged = results.flatMap((item) => item.proposals || []);
      setProposals((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const next = [...prev];
        merged.forEach((p) => {
          if (!seen.has(p.id)) {
            next.push(p);
            seen.add(p.id);
          }
        });
        return next;
      });
      const firstError = results.find((item) => item.error)?.error;
      if (firstError) {
        setActionError(firstError);
      }
      setOfferCursor((prev) => prev + slice.length);
    } finally {
      setLoadingBatch(false);
    }
  }, [fetchProposalsForBatch, offerCursor, offerIds, loadingBatch]);

  useEffect(() => {
    loadServiceRequests();
  }, [loadServiceRequests]);

  useEffect(() => {
    if (!loadingSrs && offerIds.length && offerCursor === 0 && proposals.length === 0) {
      loadNextBatch();
    }
  }, [loadingSrs, offerIds, offerCursor, proposals.length, loadNextBatch]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const sorted = [...proposals].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
      if (Number.isNaN(aTime)) return 1;
      if (Number.isNaN(bTime)) return -1;
      return bTime - aTime;
    });
    if (!term) return sorted;
    return sorted.filter((proposal) => {
      const sr = srMap[proposal.serviceRequestId];
      const haystack = [
        proposal.id,
        proposal.offerId,
        proposal.serviceRequestId,
        sr?.incotermBuyer,
        sr?.status,
        proposal.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [proposals, search, srMap]);

  const hasMoreOffers = offerCursor < offerIds.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Buyer
          </p>
          <h1 className="text-3xl font-bold text-gray-900">My Proposals</h1>
          <p className="text-sm text-gray-600">
            Proposals sent to your service requests. Review, view details, or go to award.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadServiceRequests}
            className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-800 transition hover:border-amber-300"
          >
            <FiRefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-amber-100 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">
            Service requests: {serviceRequests.length || 0}
          </span>
          <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">
            Offers fetched: {offerCursor}/{offerIds.length || 0}
          </span>
          {loadingBatch && (
            <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">
              Loading proposals...
            </span>
          )}
        </div>
        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
          <input
            type="text"
            placeholder="Search proposals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-amber-100 bg-amber-50 px-10 py-2 text-sm text-gray-800 placeholder:text-amber-400 focus:border-amber-200 focus:ring-2 focus:ring-amber-100"
          />
        </div>
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <FiAlertCircle className="mt-0.5 h-4 w-4" />
          <div className="space-y-1">
            <p className="font-semibold">Could not load proposals.</p>
            <p className="text-xs text-rose-600">{error}</p>
            <button
              type="button"
              onClick={loadServiceRequests}
              className="text-xs font-semibold text-rose-800 underline"
            >
              Retry
            </button>
          </div>
        </div>
      ) : null}

      {actionError ? (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <FiAlertCircle className="mt-0.5 h-4 w-4" />
          <div className="space-y-1">
            <p className="font-semibold">Some offers did not load.</p>
            <p className="text-xs text-amber-700">{actionError}</p>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-amber-100 bg-white shadow-sm">
        <div className="px-4 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Proposals</h2>
          <p className="text-sm text-gray-600">
            Aggregated from your service requests. Awards are limited to one provider per offer.
          </p>
        </div>

        {loadingSrs || (loadingBatch && proposals.length === 0) ? (
          <SkeletonTable />
        ) : serviceRequests.length === 0 ? (
          <div className="border-t border-dashed border-amber-100 px-6 py-10 text-center">
            <p className="text-lg font-semibold text-gray-900 mb-2">No service requests yet.</p>
            <p className="text-sm text-gray-600">
              Create a service request to receive proposals from providers.
            </p>
          </div>
        ) : proposals.length === 0 ? (
          <div className="border-t border-dashed border-amber-100 px-6 py-10 text-center">
            <p className="text-lg font-semibold text-gray-900 mb-2">No proposals received yet.</p>
            <p className="text-sm text-gray-600">
              We will show proposals here as providers respond to your offers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border-t border-amber-50">
            <table className="w-full text-sm">
              <thead className="bg-amber-50 text-xs font-semibold uppercase tracking-wide text-amber-700">
                <tr>
                  <th className="px-3 py-3 text-left">Proposal</th>
                  <th className="px-3 py-3 text-left">Fees</th>
                  <th className="px-3 py-3 text-left">Lead / ETA</th>
                  <th className="px-3 py-3 text-left">Service Request</th>
                  <th className="px-3 py-3 text-left">Offer</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-left">Created</th>
                  <th className="px-3 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50">
                {filtered.map((proposal) => {
                  const sr = srMap[proposal.serviceRequestId];
                  const isAwarded = proposal.status === "AWARDED";
                  const awardLock = Boolean(
                    proposal.offerId &&
                      awardedByOffer[proposal.offerId] &&
                      awardedByOffer[proposal.offerId] !== proposal.id
                  );
                  const disableAwardNav = !proposal.serviceRequestId || awardLock || isAwarded;
                  return (
                    <tr key={proposal.id} className="hover:bg-amber-50/60 transition">
                      <td className="px-3 py-3 font-semibold text-gray-900">
                        {proposal.id ? `#${proposal.id}` : "Proposal"}
                        <div className="text-xs text-gray-500">SR #{proposal.serviceRequestId || "N/A"}</div>
                      </td>
                      <td className="px-3 py-3 text-gray-800">
                        <div className="flex flex-col">
                          <span>Service fee: {proposal.serviceFee ?? "N/A"}</span>
                          <span>Extra: {proposal.extraCharges ?? "N/A"}</span>
                          <span className="font-semibold">Total: {proposal.totalCost ?? "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-800">
                        <div className="flex flex-col">
                          <span>Lead time: {proposal.leadTime ?? "N/A"}</span>
                          <span>ETA: {proposal.eta || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-800">
                        <div className="flex flex-col">
                          <span className="font-semibold">
                            {proposal.serviceRequestId ? `SR #${proposal.serviceRequestId}` : "N/A"}
                          </span>
                          <span className="text-xs text-gray-500">
                            Incoterm: {(sr?.incotermBuyer || "").toString().toUpperCase() || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-800">
                        <div className="flex flex-col">
                          <span className="font-semibold">{proposal.offerId || "N/A"}</span>
                          {awardLock ? (
                            <span className="text-xs text-emerald-700 font-semibold">Awarded</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={proposal.status} />
                      </td>
                      <td className="px-3 py-3 text-gray-600">{formatDate(proposal.createdAt)}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/buyer/proposals/${proposal.id}`)}
                            className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-600"
                          >
                            View
                            <FiArrowRight className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/buyer/service-requests/${proposal.serviceRequestId}/proposals`
                              )
                            }
                            disabled={disableAwardNav}
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition ${
                              disableAwardNav
                                ? "cursor-not-allowed bg-slate-100 text-slate-500"
                                : "bg-white text-amber-800 border border-amber-200 hover:border-amber-300"
                            }`}
                          >
                            {isAwarded
                              ? "Awarded"
                              : awardLock
                              ? "Awarded already"
                              : "Go to Award"}
                            <FiExternalLink className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {hasMoreOffers ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={loadNextBatch}
            disabled={loadingBatch}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-sm transition ${
              loadingBatch
                ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                : "bg-white text-amber-800 border border-amber-200 hover:border-amber-300"
            }`}
          >
            {loadingBatch ? "Loading..." : "Load more offers"}
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default BuyerMyProposalsPage;
