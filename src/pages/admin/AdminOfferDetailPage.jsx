import React from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";

const AdminOfferDetailPage = () => {
  const { offerId } = useParams();

  return (
    <AdminLayout breadcrumb={["Admin", "Offers", `#${offerId}`]} pageTitle="Offer Detail">
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-900 mb-2">
          Admin Offer Detail for #{offerId}
        </p>
        <p className="text-sm text-slate-600">To be implemented later.</p>
      </div>
    </AdminLayout>
  );
};

export default AdminOfferDetailPage;

