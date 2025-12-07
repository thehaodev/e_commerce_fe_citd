import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle, FiPlus } from "react-icons/fi";
import FilterBar from "../../components/seller/offers/FilterBar";
import SortDropdown from "../../components/seller/offers/SortDropdown";
import OfferTable from "../../components/seller/offers/OfferTable";
import OfferTableSkeleton from "../../components/seller/offers/OfferTableSkeleton";
import Pagination from "../../components/seller/offers/Pagination";
import { getMyOffers } from "../../api/offerApi";

const PAGE_SIZE = 10;

const MyOffersPage = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("created_desc");
  const [page, setPage] = useState(1);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyOffers();
      const data = res?.data ?? res;
      setOffers(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      setError("Failed to load your offers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const filtered = useMemo(() => {
    return offers
      .filter((offer) => {
        if (status && offer.status !== status) return false;
        if (search && !offer.product_name?.toLowerCase().includes(search.toLowerCase()))
          return false;
        if (dateRange.from) {
          const created = new Date(offer.created_at || offer.createdAt);
          const fromDate = new Date(dateRange.from);
          if (created < fromDate) return false;
        }
        if (dateRange.to) {
          const created = new Date(offer.created_at || offer.createdAt);
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          if (created > toDate) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sort === "created_desc") {
          return new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt);
        }
        if (sort === "created_asc") {
          return new Date(a.created_at || a.createdAt) - new Date(b.created_at || b.createdAt);
        }
        if (sort === "crd_asc") {
          return new Date(a.cargo_ready_date) - new Date(b.cargo_ready_date);
        }
        if (sort === "crd_desc") {
          return new Date(b.cargo_ready_date) - new Date(a.cargo_ready_date);
        }
        if (sort === "status") {
          return (a.status || "").localeCompare(b.status || "");
        }
        return 0;
      });
  }, [offers, status, search, dateRange, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [status, search, dateRange.from, dateRange.to, sort]);

  const handleView = (offer) => navigate(`/seller/offers/${offer.id}`);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white/90 backdrop-blur px-6 py-4 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Seller</p>
          <h1 className="text-2xl font-bold text-slate-900">My Offers</h1>
        </div>
        <button
          type="button"
          onClick={() => navigate("/seller/offers/new")}
          className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow hover:bg-amber-600"
        >
          <FiPlus /> Create Offer
        </button>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <FilterBar
            status={status}
            onStatusChange={setStatus}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            search={search}
            onSearchChange={setSearch}
          />
          <SortDropdown value={sort} onChange={setSort} />
        </div>

        {loading ? (
          <OfferTableSkeleton />
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center gap-2">
            <FiAlertCircle />
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchOffers}
              className="ml-auto text-amber-700 font-semibold hover:text-amber-800"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-900 mb-2">
              You haven't created any Offer yet.
            </p>
            <p className="text-sm text-slate-600 mb-6">
              Start by creating an offer to reach buyers on CABIN.
            </p>
            <button
              type="button"
              onClick={() => navigate("/seller/offers/new")}
              className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow hover:bg-amber-600"
            >
              Create Offer
            </button>
          </div>
        ) : (
          <>
            <OfferTable offers={paged} onView={handleView} />
            <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </>
        )}
      </main>
    </div>
  );
};

export default MyOffersPage;
