import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiAlertCircle, FiArrowLeft, FiClock, FiRefreshCw, FiTag } from "react-icons/fi";
import { getProposalById, withdrawProposal } from "../../api/proposalsApi";
import { getServiceRequestById } from "../../api/serviceRequestsApi";
import { getOfferById } from "../../api/offerApi";
import { getPrivateOfferById } from "../../api/privateOffersApi";

const normalizeProposal = (item) => ({
  id: item?.id || "",
  privateOfferId: item?.private_offer_id || "",
  offerId: item?.offer_id || "",
  serviceRequestId: item?.service_request_id || "",
  providerId: item?.provider_id || "",
  serviceFee: item?.service_fee ?? null,
  totalCost: item?.total_cost ?? null,
  leadTime: item?.lead_time ?? null,
  eta: item?.eta || null,
  serviceConditions: item?.service_conditions || null,
  extraCharges: item?.extra_charges ?? null,
  providerNotes: item?.provider_notes ?? null,
  status: item?.status || "",
  createdAt: item?.created_at || "",
  updatedAt: item?.updated_at || "",
});

const normalizeServiceRequest = (item) => ({
  id: item?.id || "",
  offerId: item?.offer_id || "",
  incotermBuyer: item?.incoterm_buyer || "",
  portOfDischarge: item?.port_of_discharge || "",
  warehouseAddress: item?.warehouse_address || "",
  warehouseCode: item?.warehouse_code || "",
  countryCode: item?.country_code || "",
  status: item?.status || "",
  contactName: item?.contact_name || "",
  contactEmail: item?.contact_email || "",
  createdAt: item?.created_at || "",
});

const formatDate = (value) => {
  if (!value) return "Not provided";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
};

const destinationFor = (request) => {
  const incoterm = (request?.incotermBuyer || "").toUpperCase();
  if (incoterm === "CFR" || incoterm === "CIF") {
    return request?.portOfDischarge || request?.countryCode || "Destination not provided";
  }
  return (
    request?.warehouseAddress ||
    request?.warehouseCode ||
    request?.countryCode ||
    "Destination not provided"
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <p className="text-sm font-semibold text-slate-900 text-right break-all">{value || "Not provided"}</p>
  </div>
);

const ProviderProposalDetailPage = () => {
  const { proposalId } = useParams();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState(null);
  const [serviceRequest, setServiceRequest] = useState(null);
  const [offer, setOffer] = useState(null);
  const [privateOffer, setPrivateOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");

  const fetchDetail = async () => {
    if (!proposalId) {
      setError("Proposal not found.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await getProposalById(proposalId);
      const normalized = normalizeProposal(res?.data ?? res);
      setProposal(normalized);

      if (normalized.serviceRequestId) {
        try {
          const srRes = await getServiceRequestById(normalized.serviceRequestId);
          setServiceRequest(normalizeServiceRequest(srRes?.data ?? srRes));
        } catch (err) {
          setServiceRequest(null);
        }
      }

      if (normalized.offerId) {
        try {
          const offerRes = await getOfferById(normalized.offerId);
          setOffer(offerRes?.data ?? offerRes);
        } catch (err) {
          setOffer(null);
        }
      }

      if (normalized.privateOfferId) {
        try {
          const poRes = await getPrivateOfferById(normalized.privateOfferId);
          setPrivateOffer(poRes?.data ?? poRes);
        } catch (err) {
          setPrivateOffer(null);
        }
      }
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Proposal not found or you are not allowed to view it.";
      setError(msg);
      setProposal(null);
      setServiceRequest(null);
      setOffer(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalId]);

  const offerLabel = useMemo(() => {
    if (!offer) return "Offer";
    return offer.product_name || `Offer ${offer.id || ""}` || "Offer";
  }, [offer]);

  const handleWithdraw = async () => {
    if (!proposal?.id) return;
    setWithdrawing(true);
    setWithdrawError("");
    try {
      const res = await withdrawProposal(proposal.id);
      const updated = res?.data ?? res;
      setProposal((prev) => ({ ...prev, status: updated?.status || "WITHDRAWN" }));
    } catch (err) {
      const msg =
        err?.response?.data?.detail || err?.message || "Unable to withdraw this proposal.";
      setWithdrawError(msg);
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/provider/proposals")}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-emerald-200 hover:text-emerald-700"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Proposals
        </button>
        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
          Proposal Detail
        </span>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-48 animate-pulse rounded bg-slate-200 mb-3" />
          <div className="h-4 w-64 animate-pulse rounded bg-slate-200 mb-6" />
          <div className="grid gap-3 lg:grid-cols-3">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="h-28 rounded-xl border border-slate-100 bg-slate-100 animate-pulse"
              />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <FiAlertCircle className="mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Proposal not found or inaccessible.</p>
            <p className="text-xs text-rose-600">{error}</p>
            <button
              type="button"
              onClick={fetchDetail}
              className="text-xs font-semibold text-rose-800 underline"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                Proposal
              </p>
              <h1 className="text-2xl font-bold text-slate-900">
                {proposal?.id ? `#PP-${proposal.id}` : "Proposal"}
              </h1>
              <p className="text-sm text-slate-600">
                Linked to {offerLabel} and service request{" "}
                {proposal?.serviceRequestId ? `#${proposal.serviceRequestId}` : "N/A"}.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                {proposal?.status || "PROPOSAL_SENT"}
              </span>
              <span className="text-xs text-slate-500">
                Created {formatDate(proposal?.createdAt)}
              </span>
              <button
                type="button"
                onClick={fetchDetail}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
              >
                <FiRefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-slate-900">
                  <FiTag className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-lg font-bold">Proposal terms</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoRow label="Service fee" value={proposal?.serviceFee} />
                  <InfoRow label="Total cost" value={proposal?.totalCost} />
                  <InfoRow
                    label="Lead time"
                    value={proposal?.leadTime ? `${proposal.leadTime} days` : "Not provided"}
                  />
                  <InfoRow label="ETA" value={formatDate(proposal?.eta)} />
                  <InfoRow label="Status" value={proposal?.status || "PROPOSAL_SENT"} />
                  <InfoRow label="Private offer" value={proposal?.privateOfferId || "Not provided"} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                    Provider notes
                  </p>
                  <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-sm text-slate-800">
                    {proposal?.providerNotes || "No provider notes added."}
                  </p>
                </div>
                {proposal?.serviceConditions && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                      Service conditions
                    </p>
                    <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-sm text-slate-800">
                      {proposal.serviceConditions}
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-slate-900">
                  <FiClock className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-lg font-bold">Service Request details</h2>
                </div>
                {serviceRequest ? (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <InfoRow
                        label="Buyer Incoterm"
                        value={(serviceRequest?.incotermBuyer || "").toString().toUpperCase()}
                      />
                      <InfoRow label="Destination" value={destinationFor(serviceRequest)} />
                      <InfoRow label="Status" value={serviceRequest?.status || "REQUESTED"} />
                      <InfoRow label="Service Request" value={serviceRequest?.id} />
                      <InfoRow label="Offer ID" value={serviceRequest?.offerId} />
                      <InfoRow label="Created" value={formatDate(serviceRequest?.createdAt)} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                        Buyer contact
                      </p>
                      <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-sm text-slate-800">
                        {serviceRequest?.contactName || serviceRequest?.contactEmail || "Not provided"}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Service request details could not be loaded.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                  Offer summary
                </h3>
                <InfoRow label="Offer" value={offerLabel} />
                <InfoRow label="Seller incoterm" value={offer?.seller_incoterm} />
                <InfoRow label="Price" value={offer?.price} />
                <InfoRow label="Cargo ready date" value={formatDate(offer?.cargo_ready_date)} />
                <InfoRow label="Port of Loading" value={offer?.port_of_loading} />
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                  Actions
                </h3>
                {withdrawError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                    {withdrawError}
                  </div>
                )}
                <button
                  type="button"
                  disabled={
                    withdrawing ||
                    proposal?.status === "AWARDED" ||
                    proposal?.status === "REJECTED" ||
                    proposal?.status === "WITHDRAWN"
                  }
                  onClick={handleWithdraw}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition ${
                    withdrawing ||
                    proposal?.status === "AWARDED" ||
                    proposal?.status === "REJECTED" ||
                    proposal?.status === "WITHDRAWN"
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {withdrawing ? "Withdrawing..." : "Withdraw Proposal"}
                </button>
                {proposal?.privateOfferId && (
                  <button
                    type="button"
                    onClick={() => navigate(`/provider/private-offers/${proposal.privateOfferId}`)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300"
                  >
                    View Private Offer
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProviderProposalDetailPage;
