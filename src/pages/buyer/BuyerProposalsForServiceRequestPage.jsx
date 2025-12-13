import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiAward,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";
import { getServiceRequestById } from "../../api/serviceRequestsApi";
import { proposalApi } from "../../api/proposalsApi";

const normalizeServiceRequest = (item) => ({
  id: item?.id || "",
  offerId: item?.offer_id || "",
  incotermBuyer: item?.incoterm_buyer || "",
  createdAt: item?.created_at || "",
});

const normalizeProposal = (item) => ({
  id: item?.id || "",
  privateOfferId: item?.private_offer_id || "",
  offerId: item?.offer_id || "",
  serviceRequestId: item?.service_request_id || "",
  providerId: item?.provider_id || "",
  serviceFee: item?.service_fee ?? null,
  totalCost: item?.total_cost ?? null,
  leadTime: item?.lead_time ?? null,
  eta: item?.eta || "",
  serviceConditions: item?.service_conditions || "",
  extraCharges: item?.extra_charges ?? null,
  providerNotes: item?.provider_notes || "",
  status: item?.status || "",
  createdAt: item?.created_at || "",
  updatedAt: item?.updated_at || "",
});

const statusStyles = {
  PROPOSAL_SENT: "bg-amber-100 text-amber-700",
  AWARDED: "bg-emerald-100 text-emerald-700",
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

const ToastStack = ({ toasts, onDismiss }) => {
  if (!toasts?.length) return null;
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => {
        const tone =
          toast.tone === "error"
            ? "border-rose-200 bg-rose-50 text-rose-700"
            : "border-emerald-200 bg-emerald-50 text-emerald-800";
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${tone}`}
          >
            {toast.tone === "error" ? (
              <FiAlertCircle className="h-5 w-5" />
            ) : (
              <FiCheckCircle className="h-5 w-5" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => onDismiss?.(toast.id)}
              className="text-current hover:opacity-75"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

const formatDate = (value) => {
  if (!value) return "Not provided";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
};

const BuyerProposalsForServiceRequestPage = () => {
  const { id, serviceRequestId: serviceRequestIdParam } = useParams();
  const serviceRequestId = id || serviceRequestIdParam;
  const navigate = useNavigate();

  const [serviceRequest, setServiceRequest] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [awardingId, setAwardingId] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, tone = "success") => {
    const idVal = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id: idVal, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== idVal));
    }, 3200);
  }, []);

  const dismissToast = useCallback((toastId) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
  }, []);

  const loadProposals = useCallback(async (offerId, srId) => {
    if (!offerId || !srId) {
      setProposals([]);
      return;
    }
    const res = await proposalApi.listProposalsForOffer(offerId);
    const payload = res?.data ?? res ?? [];
    const list = (Array.isArray(payload?.data) ? payload.data : payload)
      .map(normalizeProposal)
      .filter((p) => String(p.serviceRequestId) === String(srId));
    setProposals(list);
  }, []);

  const fetchData = useCallback(async () => {
    if (!serviceRequestId) {
      setError("Service request not found.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    setActionError("");
    try {
      const srRes = await getServiceRequestById(serviceRequestId);
      const srPayload = srRes?.data ?? srRes;
      const normalizedSr = normalizeServiceRequest(srPayload);
      setServiceRequest(normalizedSr);
      await loadProposals(normalizedSr.offerId, normalizedSr.id);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Could not load proposals for this service request.";
      setError(msg);
      setServiceRequest(null);
      setProposals([]);
    } finally {
      setLoading(false);
    }
  }, [loadProposals, serviceRequestId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const awardedProposal = useMemo(
    () => proposals.find((p) => p.status === "AWARDED"),
    [proposals]
  );

  const handleAward = async (proposalId) => {
    if (!proposalId || !serviceRequest?.offerId) return;
    const confirmed = window.confirm(
      "Award this proposal? You can only award one provider per offer."
    );
    if (!confirmed) return;
    setAwardingId(proposalId);
    setActionError("");
    try {
      await proposalApi.awardProposal(proposalId);
      showToast("Proposal awarded successfully.");
      await loadProposals(serviceRequest.offerId, serviceRequest.id);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to award this proposal.";
      setActionError(msg);
      showToast(msg, "error");
    } finally {
      setAwardingId(null);
    }
  };

  const shortId = (value) => {
    if (!value) return "N/A";
    return value.toString().slice(0, 8);
  };

  const canAward = (proposal) =>
    !awardedProposal && proposal.status === "PROPOSAL_SENT";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`/buyer/service-requests/${serviceRequestId || ""}`)}
          className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-amber-800 shadow-sm hover:border-amber-300"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Service Request
        </button>
        <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          Proposals
        </span>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-amber-100 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Proposals for Service Request
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            {serviceRequest?.id ? `SR #${serviceRequest.id}` : "Service Request"}
          </h1>
          <p className="text-sm text-gray-600">
            Review provider proposals and award exactly one.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchData}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-800 transition hover:border-amber-300"
          >
            <FiRefreshCw className="h-4 w-4" />
            Refresh
          </button>
          {awardedProposal ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold text-emerald-700">
              <FiAward className="h-4 w-4" />
              Awarded
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
              <FiClock className="h-4 w-4" />
              Awaiting award
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-28 rounded-2xl border border-amber-50 bg-amber-50 animate-pulse" />
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-32 rounded-2xl border border-amber-50 bg-amber-50 animate-pulse" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <FiAlertCircle className="mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Could not load proposals.</p>
            <p className="text-xs text-rose-600">{error}</p>
            <button
              type="button"
              onClick={fetchData}
              className="text-xs font-semibold text-rose-800 underline"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          {serviceRequest && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Service Request
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {serviceRequest.id ? `#${serviceRequest.id}` : "N/A"}
                </p>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Buyer incoterm
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {(serviceRequest.incotermBuyer || "").toString().toUpperCase() || "N/A"}
                </p>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Created
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {formatDate(serviceRequest.createdAt)}
                </p>
              </div>
            </div>
          )}

          {actionError ? (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <FiAlertCircle className="mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Action failed.</p>
                <p className="text-xs text-rose-600">{actionError}</p>
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-amber-100 bg-white shadow-sm">
            <div className="px-4 py-4">
              <h2 className="text-lg font-bold text-gray-900">Proposals</h2>
              <p className="text-sm text-gray-600">
                Providers responding to this service request&apos;s offer.
              </p>
            </div>

            {proposals.length === 0 ? (
              <div className="border-t border-dashed border-amber-100 px-6 py-10 text-center">
                <p className="text-lg font-semibold text-gray-900 mb-2">No proposals received yet.</p>
                <p className="text-sm text-gray-600">
                  Check back later or refresh to see new submissions.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border-t border-amber-50">
                <table className="w-full text-sm">
                  <thead className="bg-amber-50 text-xs font-semibold uppercase tracking-wide text-amber-700">
                    <tr>
                      <th className="px-3 py-3 text-left">Provider</th>
                      <th className="px-3 py-3 text-left">Fees</th>
                      <th className="px-3 py-3 text-left">Lead / ETA</th>
                      <th className="px-3 py-3 text-left">Notes</th>
                      <th className="px-3 py-3 text-left">Status</th>
                      <th className="px-3 py-3 text-left">Created</th>
                      <th className="px-3 py-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-50">
                    {proposals.map((proposal) => {
                      const isAwarded = proposal.status === "AWARDED";
                      return (
                        <tr key={proposal.id} className="hover:bg-amber-50/60 transition">
                          <td className="px-3 py-3 font-semibold text-gray-900">
                            {proposal.providerId ? `Provider ${shortId(proposal.providerId)}` : "Provider"}
                            <div className="text-xs text-gray-500">Proposal #{proposal.id}</div>
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
                          <td className="px-3 py-3 text-gray-700 max-w-xs">
                            <p className="line-clamp-3">
                              {proposal.providerNotes || proposal.serviceConditions || "—"}
                            </p>
                          </td>
                          <td className="px-3 py-3">
                            <StatusBadge status={proposal.status} />
                          </td>
                          <td className="px-3 py-3 text-gray-600">{formatDate(proposal.createdAt)}</td>
                          <td className="px-3 py-3">
                            {isAwarded ? (
                              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700">
                                <FiAward className="h-4 w-4" />
                                Awarded
                              </span>
                            ) : awardedProposal ? (
                              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
                                Already awarded
                              </span>
                            ) : canAward(proposal) ? (
                              <button
                                type="button"
                                onClick={() => handleAward(proposal.id)}
                                disabled={awardingId === proposal.id}
                                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition ${
                                  awardingId === proposal.id
                                    ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                                    : "bg-emerald-500 text-white hover:bg-emerald-600"
                                }`}
                              >
                                {awardingId === proposal.id ? "Awarding..." : "Award"}
                              </button>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
                                Not awardable
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BuyerProposalsForServiceRequestPage;
