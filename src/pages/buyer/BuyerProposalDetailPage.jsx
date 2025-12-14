import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  privateOfferId: item?.private_offer_id || item?.privateOfferId || "",
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

const DetailItem = ({ label, value }) => (
  <div className="rounded-xl border border-amber-50 bg-amber-50/40 px-4 py-3">
    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">{label}</p>
    <p className="text-base font-semibold text-gray-900">{value ?? "N/A"}</p>
  </div>
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/buyer/proposals"
          className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-amber-800 shadow-sm transition hover:border-amber-300"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to proposals
        </Link>
        <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          Proposal detail
        </span>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-10 w-56 animate-pulse rounded bg-amber-100" />
          <div className="rounded-2xl border border-amber-50 bg-white p-4 shadow-sm">
            <div className="h-6 w-40 animate-pulse rounded bg-amber-100" />
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-20 animate-pulse rounded-xl border border-amber-50 bg-amber-50"
                />
              ))}
            </div>
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
      ) : !proposal ? (
        <div className="rounded-2xl border border-amber-100 bg-white px-6 py-10 text-center shadow-sm">
          <p className="mb-2 text-lg font-semibold text-slate-900">Proposal not found.</p>
          <p className="text-sm text-slate-600">
            We could not find details for this proposal. It may have been removed or is unavailable.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              type="button"
              onClick={fetchProposal}
              className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-800 shadow-sm transition hover:border-amber-300"
            >
              Retry
            </button>
            <Link
              to="/buyer/proposals"
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
            >
              Back to My Proposals
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-100 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-amber-50 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Proposal Details</p>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">Proposal #{proposal.id || "N/A"}</h1>
                <StatusBadge status={proposal.status} />
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                {proposal.offerId ? (
                  <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-800">
                    Offer #{proposal.offerId}
                  </span>
                ) : null}
                {proposal.privateOfferId ? (
                  <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-800">
                    Private offer #{proposal.privateOfferId}
                  </span>
                ) : null}
                {proposal.serviceRequestId ? (
                  <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-800">
                    Service request #{proposal.serviceRequestId}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-amber-700">Updated</p>
              <p className="text-sm text-gray-700">{formatDate(proposal.updatedAt)}</p>
              <p className="text-xs text-gray-500">Created {formatDate(proposal.createdAt)}</p>
            </div>
          </div>

          <div className="grid gap-4 p-4 md:grid-cols-3">
            <div className="rounded-xl border border-amber-50 bg-amber-50/50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Costs</p>
              <p className="text-2xl font-bold text-gray-900">{proposal.totalCost ?? "N/A"}</p>
              <p className="text-xs text-gray-600">Service fee: {proposal.serviceFee ?? "N/A"}</p>
              <p className="text-xs text-gray-600">Extra charges: {proposal.extraCharges ?? "N/A"}</p>
            </div>
            <DetailItem label="Lead time" value={proposal.leadTime ?? "N/A"} />
            <DetailItem label="ETA" value={proposal.eta || "N/A"} />
            <DetailItem label="Status" value={proposal.status || "UNKNOWN"} />
            <DetailItem label="Proposal ID" value={proposal.id ? `#${proposal.id}` : "N/A"} />
            <DetailItem label="Private offer ID" value={proposal.privateOfferId || "N/A"} />
            <DetailItem label="Offer ID" value={proposal.offerId || "N/A"} />
            <DetailItem label="Service request ID" value={proposal.serviceRequestId || "N/A"} />
            <DetailItem label="Created at" value={formatDate(proposal.createdAt)} />
            <DetailItem label="Updated at" value={formatDate(proposal.updatedAt)} />
          </div>

          <div className="grid gap-4 border-t border-amber-50 px-4 py-4 md:grid-cols-2">
            <div className="rounded-xl border border-amber-50 bg-amber-50/30 px-4 py-3">
              <p className="text-sm font-semibold text-gray-900">Service conditions</p>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {proposal.serviceConditions || "No service conditions were provided."}
              </p>
            </div>
            <div className="rounded-xl border border-amber-50 bg-amber-50/30 px-4 py-3">
              <p className="text-sm font-semibold text-gray-900">Provider notes</p>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {proposal.providerNotes || "No provider notes were provided."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-amber-50 px-4 py-4">
            <button
              type="button"
              onClick={() =>
                navigate(`/buyer/service-requests/${proposal.serviceRequestId}/proposals`)
              }
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
      )}
    </div>
  );
};

export default BuyerProposalDetailPage;
