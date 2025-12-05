import NavBar from "../../components/buyer/home/NavBar";
import HeroBanner from "../../components/buyer/home/HeroBanner";
import InterestedOffers from "../../components/buyer/home/InterestedOffers";
import TopCategories from "../../components/buyer/home/TopCategories";
import OfferHot from "../../components/buyer/home/OfferHot";
import NewOffers from "../../components/buyer/home/NewOffers";
import Footer from "../../components/buyer/home/Footer";

const BuyerHomePage = () => {
  return (
    <div className="min-h-screen bg-amber-50/60 text-gray-900">
      <NavBar />
      <main className="pb-10">
        <HeroBanner />
        <InterestedOffers />
        <TopCategories />
        <OfferHot />
        <NewOffers />
      </main>
      <Footer />
    </div>
  );
};

export default BuyerHomePage;
