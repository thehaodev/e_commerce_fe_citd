import { useEffect, useMemo, useState } from "react";
import HeroBanner from "../../components/buyer/home/HeroBanner";
import InterestedOffers from "../../components/buyer/home/InterestedOffers";
import TopCategories from "../../components/buyer/home/TopCategories";
import OfferHot from "../../components/buyer/home/OfferHot";
import NewOffers from "../../components/buyer/home/NewOffers";
import Footer from "../../components/buyer/home/Footer";
import { getOffers, getOfferById } from "../../api/offerApi";
import { createBuyerInterest, getMyBuyerInterests } from "../../api/buyerInterestApi";
import { mockHotOffers, mockNewOffers, mockTopCategories } from "../../data/buyerHomeMock";

const BuyerHomePage = () => {
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offersError, setOffersError] = useState(null);

  const [interestedOffers, setInterestedOffers] = useState([]);
  const [interestedLoading, setInterestedLoading] = useState(false);
  const [interestedError, setInterestedError] = useState(null);
  const [interestedOfferIds, setInterestedOfferIds] = useState(new Set());
  const [isSubmittingOfferId, setIsSubmittingOfferId] = useState(null);
  const [interestActionError, setInterestActionError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchOffers = async () => {
      try {
        setOffersLoading(true);
        setOffersError(null);

        const res = await getOffers();
        const allOffers = res?.data ?? [];

        const activeOffers = allOffers.filter((offer) => offer?.status === "ACTIVE");
        if (isMounted) setOffers(activeOffers);
      } catch (err) {
        console.error(err);
        if (isMounted) setOffersError("Failed to load offers");
      } finally {
        if (isMounted) setOffersLoading(false);
      }
    };

    fetchOffers();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchInterestedOffers = async () => {
      try {
        setInterestedLoading(true);
        setInterestedError(null);

        const res = await getMyBuyerInterests();
        const interests = res?.data ?? [];

        const ids = interests
          .map((item) => item?.offer_id || item?.offerId)
          .filter(Boolean)
          .map(String);

        if (isMounted) setInterestedOfferIds(new Set(ids));

        const sortedInterests = [...interests].sort(
          (a, b) => new Date(b?.created_at || b?.createdAt) - new Date(a?.created_at || a?.createdAt)
        );
        const latestInterests = sortedInterests.slice(0, 4);

        const offerPromises = latestInterests
          .map((interest) => interest?.offer_id || interest?.offerId)
          .filter(Boolean)
          .map((offerId) => getOfferById(offerId));

        const offersRes = await Promise.all(offerPromises);
        const interestOffers = offersRes
          .map((r) => r?.data || r)
          .filter(Boolean);

        if (isMounted) setInterestedOffers(interestOffers);
      } catch (err) {
        console.error(err);
        if (isMounted) setInterestedError("Failed to load interested offers");
      } finally {
        if (isMounted) setInterestedLoading(false);
      }
    };

    fetchInterestedOffers();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleExpressInterest = async (offerId) => {
    if (!offerId) return;

    try {
      setInterestActionError(null);
      setIsSubmittingOfferId(offerId);

      await createBuyerInterest(offerId);

      setInterestedOfferIds((prev) => {
        const next = new Set(prev);
        next.add(String(offerId));
        return next;
      });
    } catch (error) {
      console.error(error);
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to express interest. Please try again.";
      setInterestActionError(message);
    } finally {
      setIsSubmittingOfferId(null);
    }
  };

  const sortedByCreated = useMemo(() => {
    return [...offers].sort(
      (a, b) => new Date(b?.created_at || b?.createdAt) - new Date(a?.created_at || a?.createdAt)
    );
  }, [offers]);

  const hasApiOffers = sortedByCreated.length > 0;
  const newOffers = useMemo(
    () => (hasApiOffers ? sortedByCreated.slice(0, 6) : mockNewOffers),
    [hasApiOffers, sortedByCreated]
  );
  const hotOffers = useMemo(
    () => (hasApiOffers ? sortedByCreated.slice(0, 3) : mockHotOffers),
    [hasApiOffers, sortedByCreated]
  );
  const hotLoading = hasApiOffers ? offersLoading : false;
  const newLoading = hasApiOffers ? offersLoading : false;
  const sectionError = hasApiOffers ? offersError || interestActionError : null;
  const interestProps = hasApiOffers
    ? {
        interestedOfferIds,
        submittingOfferId: isSubmittingOfferId,
        onExpressInterest: handleExpressInterest,
      }
    : {};

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="pb-16">
        <HeroBanner />
        <InterestedOffers
          offers={interestedOffers}
          isLoading={interestedLoading}
          error={interestedError}
        />
        <TopCategories categories={mockTopCategories} />
        <OfferHot
          offers={hotOffers}
          isLoading={hotLoading}
          error={sectionError}
          {...interestProps}
        />
        <NewOffers
          offers={newOffers}
          isLoading={newLoading}
          error={sectionError}
          {...interestProps}
        />
      </main>
      <Footer />
    </div>
  );
};

export default BuyerHomePage;
