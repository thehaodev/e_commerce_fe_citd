import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProviderStats from "../../components/provider/ProviderStats";
import IncomingServiceRequestsPanel from "../../components/provider/IncomingServiceRequestsPanel";
import PrivateOffersPanel from "../../components/provider/PrivateOffersPanel";
import ProposalsPanel from "../../components/provider/ProposalsPanel";
import { getMyPrivateOffers, getMyProposals } from "../../api/providerApi";

const mockServiceRequests = [
  {
    id: "sr-001",
    offerProductName: "Electronics Batch #184",
    buyerName: "Buyer A",
    incotermBuyer: "CIF",
    destination: "Port of Singapore",
    createdAt: new Date().toISOString(),
    status: "REQUESTED",
    hasPrivateOffer: false,
  },
  {
    id: "sr-002",
    offerProductName: "Textile Shipment",
    buyerName: "Buyer B",
    incotermBuyer: "DAP",
    destination: "Hanoi Warehouse #3",
    createdAt: new Date().toISOString(),
    status: "REQUESTED",
    hasPrivateOffer: true,
  },
];

export default function ProviderHome() {
  const [privateOffers, setPrivateOffers] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [isLoadingPrivateOffers, setIsLoadingPrivateOffers] = useState(true);
  const [isLoadingProposals, setIsLoadingProposals] = useState(true);
  const [errorPrivateOffers, setErrorPrivateOffers] = useState(null);
  const [errorProposals, setErrorProposals] = useState(null);
  const navigate = useNavigate();

  const fetchPrivateOffers = async () => {
    setIsLoadingPrivateOffers(true);
    setErrorPrivateOffers(null);
    try {
      const res = await getMyPrivateOffers();
      setPrivateOffers(res?.data || []);
    } catch (err) {
      setErrorPrivateOffers(
        err?.message || "Unable to load private offers right now."
      );
    } finally {
      setIsLoadingPrivateOffers(false);
    }
  };

  const fetchProposals = async () => {
    setIsLoadingProposals(true);
    setErrorProposals(null);
    try {
      const res = await getMyProposals();
      setProposals(res?.data || []);
    } catch (err) {
      setErrorProposals(err?.message || "Unable to load proposals right now.");
    } finally {
      setIsLoadingProposals(false);
    }
  };

  useEffect(() => {
    fetchPrivateOffers();
    fetchProposals();
  }, []);

  const stats = useMemo(() => {
    const totalPrivateOffers = privateOffers.length;
    const totalProposals = proposals.length;
    const awardedProposals = proposals.filter(
      (p) => p.status === "AWARDED"
    ).length;
    const rejectedOrExpiredProposals = proposals.filter(
      (p) => p.status === "REJECTED" || p.status === "EXPIRED"
    ).length;
    return {
      totalPrivateOffers,
      totalProposals,
      awardedProposals,
      rejectedOrExpiredProposals,
    };
  }, [privateOffers, proposals]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-slate-500">
            Provider Workspace
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            Provider Home Dashboard
          </h1>
          <p className="text-slate-600 max-w-3xl">
            Monitor service requests, track private offers, and manage proposals
            to win more shipments.
          </p>
        </header>

        <ProviderStats
          totalPrivateOffers={stats.totalPrivateOffers}
          totalProposals={stats.totalProposals}
          awardedProposals={stats.awardedProposals}
          rejectedOrExpiredProposals={stats.rejectedOrExpiredProposals}
          openServiceRequests={mockServiceRequests.length}
        />

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Quick Actions
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Jump into key provider workflows.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold text-sm shadow-sm"
              onClick={() => navigate("/offers")}
            >
              Browse Active Offers
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-sm font-semibold"
              onClick={() => navigate("/provider/service-requests")}
            >
              All Service Requests
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-sm font-semibold"
              onClick={() => navigate("/provider/private-offers")}
            >
              All Private Offers
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-sm font-semibold"
              onClick={() => navigate("/provider/proposals")}
            >
              All Proposals
            </button>
          </div>
        </section>

        <IncomingServiceRequestsPanel
          isLoading={false}
          error={null}
          serviceRequests={mockServiceRequests}
          onRetry={() => console.log("Refresh service requests")}
        />

        <PrivateOffersPanel
          isLoading={isLoadingPrivateOffers}
          error={errorPrivateOffers}
          privateOffers={privateOffers}
        />

        <ProposalsPanel
          isLoading={isLoadingProposals}
          error={errorProposals}
          proposals={proposals}
        />
      </div>
    </div>
  );
}
