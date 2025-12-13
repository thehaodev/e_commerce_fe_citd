import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProviderStats from "../../components/provider/ProviderStats";
import IncomingServiceRequestsPanel from "../../components/provider/IncomingServiceRequestsPanel";
import PrivateOffersPanel from "../../components/provider/PrivateOffersPanel";
import ProposalsPanel from "../../components/provider/ProposalsPanel";
import { fetchMyPrivateOffers } from "../../api/privateOffersApi";
import { getMyProposals } from "../../api/proposalsApi";
import { getServiceRequestById } from "../../api/serviceRequestsApi";
import useProviderIncomingServiceRequests from "../../hooks/useProviderIncomingServiceRequests";

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
  createdAt: item?.created_at || "",
  updatedAt: item?.updated_at || "",
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
  contactPhone: item?.contact_phone || "",
  contactEmail: item?.contact_email || "",
  createdAt: item?.created_at || "",
  updatedAt: item?.updated_at || "",
});

export default function ProviderHome() {
  const navigate = useNavigate();
  const [privateOffers, setPrivateOffers] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [serviceRequestMap, setServiceRequestMap] = useState({});

  const [isLoadingPrivateOffers, setIsLoadingPrivateOffers] = useState(true);
  const [isLoadingProposals, setIsLoadingProposals] = useState(true);
  const [errorPrivateOffers, setErrorPrivateOffers] = useState(null);
  const [errorProposals, setErrorProposals] = useState(null);

  const {
    rows: incomingRequests,
    isLoading: isLoadingIncomingRequests,
    error: errorIncomingRequests,
    refetch: refreshIncomingRequests,
  } = useProviderIncomingServiceRequests({ offerEnrichmentLimit: 10 });

  const hydrateServiceRequestMap = async (privateOfferList, proposalList) => {
    try {
      const srIds = [
        ...new Set(
          [...privateOfferList, ...proposalList]
            .map((item) => item.serviceRequestId)
            .filter(Boolean)
        ),
      ];
      if (srIds.length === 0) {
        setServiceRequestMap({});
        return;
      }
      const srMap = {};
      await Promise.all(
        srIds.map(async (srId) => {
          try {
            const srRes = await getServiceRequestById(srId);
            const payload = srRes?.data ?? srRes;
            srMap[srId] = normalizeServiceRequest(payload);
          } catch (err) {
            srMap[srId] = null;
          }
        })
      );
      setServiceRequestMap(srMap);
    } catch (err) {
      setServiceRequestMap({});
    }
  };

  const fetchAll = async () => {
    setIsLoadingPrivateOffers(true);
    setIsLoadingProposals(true);
    setErrorPrivateOffers(null);
    setErrorProposals(null);
    try {
      const [poRes, proposalRes] = await Promise.all([fetchMyPrivateOffers(), getMyProposals()]);
      const rawPrivateOffers = poRes?.data ?? poRes ?? [];
      const rawProposals = proposalRes?.data ?? proposalRes ?? [];
      const privateOfferList = Array.isArray(rawPrivateOffers?.data) ? rawPrivateOffers.data : rawPrivateOffers;
      const proposalList = Array.isArray(rawProposals?.data) ? rawProposals.data : rawProposals;
      const normalizedPrivateOffers = privateOfferList.map(normalizePrivateOffer);
      const normalizedProposals = proposalList.map(normalizeProposal);
      setPrivateOffers(privateOfferList);
      setProposals(proposalList);
      await hydrateServiceRequestMap(normalizedPrivateOffers, normalizedProposals);
    } catch (err) {
      const message = err?.message || "Unable to load provider data right now.";
      setErrorPrivateOffers(message);
      setErrorProposals(message);
      setPrivateOffers([]);
      setProposals([]);
      setServiceRequestMap({});
    } finally {
      setIsLoadingPrivateOffers(false);
      setIsLoadingProposals(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const totalPrivateOffers = privateOffers.length;
    const totalProposals = proposals.length;
    const awardedProposals = proposals.filter((p) => p.status === "AWARDED").length;
    const rejectedOrExpiredProposals = proposals.filter(
      (p) => p.status === "REJECTED" || p.status === "EXPIRED" || p.status === "WITHDRAWN"
    ).length;
    return {
      totalPrivateOffers,
      totalProposals,
      awardedProposals,
      rejectedOrExpiredProposals,
    };
  }, [privateOffers, proposals]);

  const combinedServiceRequestMap = useMemo(() => {
    const map = { ...serviceRequestMap };
    incomingRequests.forEach((sr) => {
      if (sr?.id && !map[sr.id]) {
        map[sr.id] = sr;
      }
    });
    return map;
  }, [incomingRequests, serviceRequestMap]);

  const panelRequests = useMemo(
    () =>
      incomingRequests.slice(0, 5).map((sr) => ({
        id: sr.id,
        offerId: sr.offerId,
        offerProductName: sr.offerProductName || sr.offerCode || sr.offerId,
        buyerName: sr.contactName || sr.contactEmail || sr.buyerId || "Buyer",
        incotermBuyer: (sr.incotermBuyer || "").toUpperCase(),
        destination: sr.destination,
        createdAt: sr.createdDate,
        status: sr.status || sr.serviceRequest?.status,
        serviceRequest: sr.serviceRequest,
        offer: sr.offer,
      })),
    [incomingRequests]
  );

  const handleOpenServiceRequest = (srId) => {
    if (!srId) return;
    const match = incomingRequests.find((item) => `${item.id}` === `${srId}`);
    navigate(`/provider/service-requests/${srId}`, {
      state: { serviceRequest: match?.serviceRequest, offer: match?.offer },
    });
  };

  const handleCreatePrivateOffer = (srId, offerId) => {
    if (srId && offerId) {
      const match = incomingRequests.find((item) => `${item.id}` === `${srId}`);
      navigate(`/provider/private-offers/new?serviceRequestId=${srId}&offerId=${offerId}`, {
        state: { serviceRequest: match?.serviceRequest, offer: match?.offer },
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-slate-500">Provider Workspace</p>
          <h1 className="text-3xl font-bold text-slate-900">Provider Home Dashboard</h1>
          <p className="text-slate-600 max-w-3xl">
            Monitor service requests, track private offers, and manage proposals to win more shipments.
          </p>
        </header>

        <ProviderStats
          totalPrivateOffers={stats.totalPrivateOffers}
          totalProposals={stats.totalProposals}
          awardedProposals={stats.awardedProposals}
          rejectedOrExpiredProposals={stats.rejectedOrExpiredProposals}
          openServiceRequests={incomingRequests.length}
        />

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Quick Actions</h2>
          <p className="text-sm text-slate-500 mb-4">Jump into key provider workflows.</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-sm font-semibold"
              onClick={() => navigate("/provider/service-requests")}
            >
              Service Requests
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-sm font-semibold"
              onClick={() => navigate("/provider/private-offers")}
            >
              My Private Offers
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-sm font-semibold"
              onClick={() => navigate("/provider/proposals")}
            >
              My Proposals
            </button>
          </div>
        </section>

        <IncomingServiceRequestsPanel
          isLoading={isLoadingIncomingRequests}
          error={errorIncomingRequests}
          serviceRequests={panelRequests}
          onRetry={refreshIncomingRequests}
          onOpenDetail={handleOpenServiceRequest}
          onCreatePrivateOffer={handleCreatePrivateOffer}
          onBrowseOffers={() => navigate("/provider/service-requests")}
        />

        <PrivateOffersPanel
          isLoading={isLoadingPrivateOffers}
          error={errorPrivateOffers}
          privateOffers={privateOffers}
          onRetry={fetchAll}
        />

        <ProposalsPanel
          isLoading={isLoadingProposals}
          error={errorProposals}
          proposals={proposals}
          serviceRequestMap={combinedServiceRequestMap}
        />
      </div>
    </div>
  );
}
