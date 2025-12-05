import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/landing/LandingPage";
import RegisterPage from "./pages/auth/RegisterPage";
import BuyerHomePage from "./pages/buyer/BuyerHomePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LandingPage defaultLoginOpen />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/buyer/home" element={<BuyerHomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
