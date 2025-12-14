import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiAlertCircle, FiArrowLeft, FiExternalLink } from "react-icons/fi";
import { proposalApi } from "../../api/proposalsApi";

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
  serviceConditions: item?.service_conditions || "",
  providerNotes: item?.provider_notes || "",
  createdAt: item?.created_at || "",
  updatedAt: item?.updated_at || "",
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
  return d.toLocaleString();
};

const BuyerProposalDetailPage = () => {
  const { proposalId } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProposal = useCallback(async () => {
    if (!proposalId) {
      setError("Proposal not found.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await proposalApi.getProposalById(proposalId);
      const raw = res?.data ?? res;
      setProposal(normalizeProposal(raw));
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to load this proposal.";
      setError(msg);
      setProposal(null);
    } finally {
      setLoading(false);
    }
  }, [proposalId]);

  useEffect(() => {
    fetchProposal();
  }, [fetchProposal]);

  const awardDisabled = useMemo(
    () => proposal?.status === "AWARDED" || !proposal?.serviceRequestId,
    [proposal]
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/buyer/proposals")}
          className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-amber-800 shadow-sm hover:border-amber-300"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back
        </button>
        <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          Proposal detail
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-10 w-48 rounded bg-amber-100 animate-pulse" />
          <div className="h-24 rounded-2xl border border-amber-50 bg-amber-50 animate-pulse" />
          <div className="grid gap-3 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-28 rounded-2xl border border-amber-50 bg-amber-50 animate-pulse" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <FiAlertCircle className="mt-0.5 h-4 w-4" />
          <div className="space-y-1">
            <p className="font-semibold">Could not load proposal.</p>
            <p className="text-xs text-rose-600">{error}</p>
            <button
              type="button"
              onClick={fetchProposal}
              className="text-xs font-semibold text-rose-800 underline"
            >
              Retry
            </button>
          </div>
        </div>
      ) : !proposal ? null : (
        <>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                Proposal #{proposal.id}
              </h1>
              <StatusBadge status={proposal.status} />
            </div>
            <p className="text-sm text-gray-600">
              Offer #{proposal.offerId || "N/A"} • Service Request #{proposal.serviceRequestId || "N/A"}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Total cost</p>
              <p className="text-2xl font-bold text-gray-900">{proposal.totalCost ?? "N/A"}</p>
              <p className="text-xs text-gray-600">Service fee: {proposal.serviceFee ?? "N/A"}</p>
              <p className="text-xs text-gray-600">Extra charges: {proposal.extraCharges ?? "N/A"}</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Lead / ETA</p>
              <p className="text-lg font-bold text-gray-900">
                Lead time: {proposal.leadTime ?? "N/A"}
              </p>
              <p className="text-sm text-gray-700">ETA: {proposal.eta || "N/A"}</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Timestamps</p>
              <p className="text-sm font-semibold text-gray-900">Created</p>
              <p className="text-sm text-gray-700">{formatDate(proposal.createdAt)}</p>
              <p className="text-sm font-semibold text-gray-900 mt-2">Updated</p>
              <p className="text-sm text-gray-700">{formatDate(proposal.updatedAt)}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-white shadow-sm">
            <div className="border-b border-amber-50 px-4 py-3">
              <p className="text-sm font-semibold text-gray-900">Notes</p>
              <p className="text-sm text-gray-700">
                {proposal.providerNotes || proposal.serviceConditions || "No provider notes provided."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 px-4 py-3">
              <button
                type="button"
                onClick={() => navigate(`/buyer/service-requests/${proposal.serviceRequestId}/proposals`)}
                disabled={awardDisabled}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition ${
                  awardDisabled
                    ? "cursor-not-allowed bg-slate-100 text-slate-500"
                    : "bg-amber-500 text-white hover:bg-amber-600"
                }`}
              >
                {proposal.status === "AWARDED" ? "Awarded" : "Go to Award"}
                <FiExternalLink className="h-4 w-4" />
              </button>
              <Link
                to="/buyer/proposals"
                className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-800 shadow-sm transition hover:border-amber-300"
              >
                Back to My Proposals
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BuyerProposalDetailPage;
