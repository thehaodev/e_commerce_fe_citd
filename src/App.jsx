import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/landing/LandingPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import BuyerHomePage from "./pages/buyer/BuyerHomePage";
import BuyerOfferDetailPage from "./pages/buyer/BuyerOfferDetailPage";
import BuyerServiceRequestCreatePage from "./pages/buyer/BuyerServiceRequestCreatePage";
import BuyerServiceRequestDetailPage from "./pages/buyer/BuyerServiceRequestDetailPage";
import BuyerServiceRequestListPage from "./pages/buyer/BuyerServiceRequestListPage";
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
import ProviderServiceRequestsPage from "./pages/provider/ServiceRequestsPage";
import ServiceRequestDetailPage from "./pages/provider/ServiceRequestDetailPage";
import ProviderPrivateOffersPage from "./pages/provider/ProviderPrivateOffersPage";
import ProviderCreatePrivateOfferPage from "./pages/provider/ProviderCreatePrivateOfferPage";
import ProviderPrivateOfferDetailPage from "./pages/provider/ProviderPrivateOfferDetailPage";
import ProviderProposalsPage from "./pages/provider/ProviderProposalsPage";
import ProviderProposalDetailPage from "./pages/provider/ProviderProposalDetailPage";
import ProviderProposalCreatePage from "./pages/provider/ProviderProposalCreatePage";
import BuyerProposalsForServiceRequestPage from "./pages/buyer/BuyerProposalsForServiceRequestPage";

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
        path="/buyer/offers/:offerId"
        element={
          <RequireAuth allowedRoles={["BUYER"]}>
            <BuyerLayout>
              <BuyerOfferDetailPage />
            </BuyerLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/buyer/service-requests"
        element={
          <RequireAuth allowedRoles={["BUYER"]}>
            <BuyerLayout>
              <BuyerServiceRequestListPage />
            </BuyerLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/buyer/service-requests/new"
        element={
          <RequireAuth allowedRoles={["BUYER"]}>
            <BuyerLayout>
              <BuyerServiceRequestCreatePage />
            </BuyerLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/buyer/service-requests/:serviceRequestId"
        element={
          <RequireAuth allowedRoles={["BUYER"]}>
            <BuyerLayout>
              <BuyerServiceRequestDetailPage />
            </BuyerLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/buyer/service-requests/:id/proposals"
        element={
          <RequireAuth allowedRoles={["BUYER"]}>
            <BuyerLayout>
              <BuyerProposalsForServiceRequestPage />
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
        path="/provider"
        element={
          <RequireAuth allowedRoles={["PROVIDER"]}>
            <Navigate to="/provider/private-offers" replace />
          </RequireAuth>
        }
      />
      <Route
        path="/provider/service-requests"
        element={
          <RequireAuth allowedRoles={["PROVIDER"]}>
            <ProviderLayout>
              <ProviderServiceRequestsPage />
            </ProviderLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/provider/service-requests/:serviceRequestId"
        element={
          <RequireAuth allowedRoles={["PROVIDER"]}>
            <ProviderLayout>
              <ServiceRequestDetailPage />
            </ProviderLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/provider/private-offers"
        element={
          <RequireAuth allowedRoles={["PROVIDER"]}>
            <ProviderLayout>
              <ProviderPrivateOffersPage />
            </ProviderLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/provider/private-offers/new"
        element={
          <RequireAuth allowedRoles={["PROVIDER"]}>
            <ProviderLayout>
              <ProviderCreatePrivateOfferPage />
            </ProviderLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/provider/private-offers/:privateOfferId"
        element={
          <RequireAuth allowedRoles={["PROVIDER"]}>
            <ProviderLayout>
              <ProviderPrivateOfferDetailPage />
            </ProviderLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/provider/proposals"
        element={
          <RequireAuth allowedRoles={["PROVIDER"]}>
            <ProviderLayout>
              <ProviderProposalsPage />
            </ProviderLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/provider/proposals/new"
        element={
          <RequireAuth allowedRoles={["PROVIDER"]}>
            <ProviderLayout>
              <ProviderProposalCreatePage />
            </ProviderLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/provider/proposals/:proposalId"
        element={
          <RequireAuth allowedRoles={["PROVIDER"]}>
            <ProviderLayout>
              <ProviderProposalDetailPage />
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
