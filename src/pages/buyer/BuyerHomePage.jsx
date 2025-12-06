import { useEffect, useMemo, useState } from "react";
import NavBar from "../../components/buyer/home/NavBar";
import HeroBanner from "../../components/buyer/home/HeroBanner";
import InterestedOffers from "../../components/buyer/home/InterestedOffers";
import TopCategories from "../../components/buyer/home/TopCategories";
import OfferHot from "../../components/buyer/home/OfferHot";
import NewOffers from "../../components/buyer/home/NewOffers";
import Footer from "../../components/buyer/home/Footer";
import { getOffers, getOfferById } from "../../api/offerApi";
import { getMyBuyerInterests } from "../../api/buyerInterestApi";

const BuyerHomePage = () => {
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offersError, setOffersError] = useState(null);

  const [interestedOffers, setInterestedOffers] = useState([]);
  const [interestedLoading, setInterestedLoading] = useState(false);
  const [interestedError, setInterestedError] = useState(null);

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

        const sortedInterests = [...interests].sort(
          (a, b) => new Date(b?.created_at || b?.createdAt) - new Date(a?.created_at || a?.createdAt)
        );
        const latestInterests = sortedInterests.slice(0, 3);

        const offerPromises = latestInterests
          .filter((interest) => interest?.offer_id)
          .map((interest) => getOfferById(interest.offer_id));

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

  const sortedByCreated = useMemo(() => {
    return [...offers].sort(
      (a, b) => new Date(b?.created_at || b?.createdAt) - new Date(a?.created_at || a?.createdAt)
    );
  }, [offers]);

  const newOffers = useMemo(() => sortedByCreated.slice(0, 8), [sortedByCreated]);
  const hotOffers = useMemo(() => sortedByCreated.slice(0, 8), [sortedByCreated]);

  return (
    <div className="min-h-screen bg-amber-50/60 text-gray-900">
      <NavBar />
      <main className="pb-10">
        <HeroBanner />
        <InterestedOffers
          offers={interestedOffers}
          isLoading={interestedLoading}
          error={interestedError}
        />
        <TopCategories />
        <OfferHot offers={hotOffers} isLoading={offersLoading} error={offersError} />
        <NewOffers offers={newOffers} isLoading={offersLoading} error={offersError} />
      </main>
      <Footer />
    </div>
  );
};

export default BuyerHomePage;
