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
import BuyerLayout from "./components/layout/BuyerLayout";
import SellerLayout from "./components/layout/SellerLayout";
import ProviderLayout from "./components/layout/ProviderLayout";
import SellerShell from "./components/layout/SellerShell";
import AdminOffersPage from "./pages/admin/AdminOffersPage";
import AdminOfferDetailPage from "./pages/admin/AdminOfferDetailPage";

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
            <BuyerLayout>
              <BuyerHomePage />
            </BuyerLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/seller/home"
        element={
          <RequireAuth allowedRoles={["SELLER"]}>
            <SellerShell>
              <SellerHome />
            </SellerShell>
          </RequireAuth>
        }
      />
      <Route
        path="/seller/offers"
        element={
          <RequireAuth allowedRoles={["SELLER"]}>
            <SellerLayout>
              <MyOffersPage />
            </SellerLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/seller/offers/new"
        element={
          <RequireAuth allowedRoles={["SELLER"]}>
            <SellerLayout>
              <CreateOfferPage />
            </SellerLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/seller/offers/:offerId"
        element={
          <RequireAuth allowedRoles={["SELLER"]}>
            <SellerLayout>
              <OfferDetailPage />
            </SellerLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/provider/home"
        element={
          <RequireAuth allowedRoles={["PROVIDER"]}>
            <ProviderLayout>
              <ProviderHome />
            </ProviderLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/offers"
        element={
          <RequireAuth allowedRoles={["ADMIN"]}>
            <AdminOffersPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/offers/:offerId"
        element={
          <RequireAuth allowedRoles={["ADMIN"]}>
            <AdminOfferDetailPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAuth allowedRoles={["ADMIN"]}>
            <Navigate to="/admin/offers" replace />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
