import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProviderStats from "../../components/provider/ProviderStats";
import IncomingServiceRequestsPanel from "../../components/provider/IncomingServiceRequestsPanel";
import PrivateOffersPanel from "../../components/provider/PrivateOffersPanel";
import ProposalsPanel from "../../components/provider/ProposalsPanel";
import { fetchMyPrivateOffers } from "../../api/privateOffersApi";
import { getMyProposals } from "../../api/proposalsApi";
import { getServiceRequestById } from "../../api/serviceRequestsApi";
import { getOfferById } from "../../api/offerApi";

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

export default function ProviderHome() {
  const navigate = useNavigate();
  const [privateOffers, setPrivateOffers] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);

  const [isLoadingPrivateOffers, setIsLoadingPrivateOffers] = useState(true);
  const [isLoadingProposals, setIsLoadingProposals] = useState(true);
  const [isLoadingServiceRequests, setIsLoadingServiceRequests] = useState(true);

  const [errorPrivateOffers, setErrorPrivateOffers] = useState(null);
  const [errorProposals, setErrorProposals] = useState(null);
  const [errorServiceRequests, setErrorServiceRequests] = useState(null);

  const fetchServiceRequests = async (privateOfferList, proposalList) => {
    setIsLoadingServiceRequests(true);
    setErrorServiceRequests(null);
    try {
      const srIds = [
        ...new Set(
          [...privateOfferList, ...proposalList]
            .map((item) => item.serviceRequestId)
            .filter(Boolean)
        ),
      ];

      if (srIds.length === 0) {
        setServiceRequests([]);
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

      const rows = srIds
        .map((srId) => {
          const sr = srMap[srId];
          if (!sr) return null;
          const relatedPrivateOffers = privateOfferList.filter((item) => item.serviceRequestId === srId);
          const relatedProposals = proposalList.filter((item) => item.serviceRequestId === srId);
          const offer = sr.offerId ? offerMap[sr.offerId] : null;
          const offerLabel = offer?.product_name || sr.offerId || "Offer";
          const buyerLabel = sr.contactName || sr.contactEmail || sr.buyerId || "Buyer";
          return {
            ...sr,
            offer,
            offerLabel,
            buyerLabel,
            destination: destinationFor(sr),
            hasPrivateOffer: relatedPrivateOffers.length > 0,
            privateOfferId: relatedPrivateOffers[0]?.id || null,
            proposalId: relatedProposals[0]?.id || null,
          };
        })
        .filter(Boolean);

      setServiceRequests(rows);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Could not load service requests for your workspace.";
      setErrorServiceRequests(msg);
      setServiceRequests([]);
    } finally {
      setIsLoadingServiceRequests(false);
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
      fetchServiceRequests(normalizedPrivateOffers, normalizedProposals);
    } catch (err) {
      const message = err?.message || "Unable to load provider data right now.";
      setErrorPrivateOffers(message);
      setErrorProposals(message);
      setPrivateOffers([]);
      setProposals([]);
      setServiceRequests([]);
      setIsLoadingServiceRequests(false);
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

  const serviceRequestMap = useMemo(() => {
    const map = {};
    serviceRequests.forEach((sr) => {
      map[sr.id] = sr;
    });
    return map;
  }, [serviceRequests]);

  const panelRequests = serviceRequests.map((sr) => ({
    id: sr.id,
    offerProductName: sr.offerLabel,
    buyerName: sr.buyerLabel,
    incotermBuyer: (sr.incotermBuyer || "").toUpperCase(),
    destination: sr.destination,
    createdAt: sr.createdAt,
    status: sr.status,
    hasPrivateOffer: sr.hasPrivateOffer,
    privateOfferId: sr.privateOfferId,
  }));

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
          openServiceRequests={serviceRequests.length}
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
          isLoading={isLoadingServiceRequests}
          error={errorServiceRequests}
          serviceRequests={panelRequests}
          onRetry={fetchAll}
          onOpenDetail={(srId) => srId && navigate(`/provider/service-requests/${srId}`)}
          onCreatePrivateOffer={(srId) => {
            const sr = serviceRequestMap[srId];
            if (sr?.id && sr?.offerId) {
              navigate(`/provider/private-offers/new?serviceRequestId=${sr.id}&offerId=${sr.offerId}`);
            }
          }}
          onOpenPrivateOffer={(poId) => poId && navigate(`/provider/private-offers/${poId}`)}
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
          serviceRequestMap={serviceRequestMap}
        />
      </div>
    </div>
  );
}
