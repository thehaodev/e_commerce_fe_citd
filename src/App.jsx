import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/landing/LandingPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import BuyerHomePage from "./pages/buyer/BuyerHomePage";
import SellerHome from "./pages/seller/SellerHome";
import CreateOfferPage from "./pages/seller/CreateOfferPage";
import MyOffersPage from "./pages/seller/MyOffersPage";
import OfferDetailPage from "./pages/seller/OfferDetailPage";
import ProviderHome from "./pages/provider/ProviderHome";
import RequireAuth from "./components/auth/RequireAuth";
import useAuth from "./hooks/useAuth";

export default function App() {
  const { initAuth } = useAuth();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LandingPage defaultLoginOpen />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/buyer/home"
        element={
          <RequireAuth allowedRoles={["BUYER"]}>
            <BuyerHomePage />
          </RequireAuth>
        }
      />
      <Route
        path="/seller/home"
        element={
          <RequireAuth allowedRoles={["SELLER"]}>
            <SellerHome />
          </RequireAuth>
        }
      />
      <Route
        path="/seller/offers"
        element={
          <RequireAuth allowedRoles={["SELLER"]}>
            <MyOffersPage />
          </RequireAuth>
        }
      />
      <Route
        path="/seller/offers/new"
        element={
          <RequireAuth allowedRoles={["SELLER"]}>
            <CreateOfferPage />
          </RequireAuth>
        }
      />
      <Route
        path="/seller/offers/:offerId"
        element={
          <RequireAuth allowedRoles={["SELLER"]}>
            <OfferDetailPage />
          </RequireAuth>
        }
      />
      <Route
        path="/provider/home"
        element={
          <RequireAuth allowedRoles={["PROVIDER"]}>
            <ProviderHome />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
