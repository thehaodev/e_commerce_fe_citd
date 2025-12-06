import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/landing/LandingPage";
import RegisterPage from "./pages/auth/RegisterPage";
import BuyerHomePage from "./pages/buyer/BuyerHomePage";
import SellerHome from "./pages/seller/SellerHome";
import CreateOfferPage from "./pages/seller/CreateOfferPage";
import MyOffersPage from "./pages/seller/MyOffersPage";
import OfferDetailPage from "./pages/seller/OfferDetailPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LandingPage defaultLoginOpen />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/buyer/home" element={<BuyerHomePage />} />
      <Route path="/seller/home" element={<SellerHome />} />
      <Route path="/seller/offers" element={<MyOffersPage />} />
      <Route path="/seller/offers/new" element={<CreateOfferPage />} />
      <Route path="/seller/offers/:offerId" element={<OfferDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
