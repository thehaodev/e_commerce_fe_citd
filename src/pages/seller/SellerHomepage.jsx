import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/seller/Sidebar';
import Header from '../../components/seller/Header';
import SearchFilterBar from '../../components/seller/SearchFilterBar';
import OfferTable from '../../components/seller/OfferTable';
import Pagination from '../../components/seller/Pagination';
import { fetchOffersFromAPI } from '../../api/offerApi';
import { mockOffers } from '../../data/mockOffers';

// Design Palette
const colors = {
  primaryYellow: '#F4C02A',
  primaryBlack: '#151515',
  primaryWhite: '#FFFFFF',
  gray100: '#F7F7F7',
  gray200: '#EAEAEA',
  gray400: '#A3A3A3',
  gray600: '#6E6E6E',
  gray900: '#212121',
  status: {
    OPEN: { bg: '#F7C7CB', text: '#A1444A' },
    ACTIVE: { bg: '#5A3A1E', text: '#F4D9B1' },
    LOCKED: { bg: '#4D6633', text: '#E3F1C9' },
  },
};

export default function SellerHomepage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const apiData = await fetchOffersFromAPI();
        setOffers(apiData);
      } catch (err) {
        setError('Failed to load API data. Showing mock data.');
        setOffers(mockOffers);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex min-h-screen font-sans" style={{ backgroundColor: colors.gray100 }}>
      <Sidebar colors={colors} />
      <main className="flex-1 ml-64 p-8">
        <div className="bg-white rounded-[20px] p-8 shadow-sm">
          <Header colors={colors} />
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin h-10 w-10 rounded-full border-4 border-gray-300 border-t-black"></div>
            </div>
          ) : offers.length > 0 ? (
            <>
              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-700 font-semibold border border-red-300">
                  {error}
                </div>
              )}
              <SearchFilterBar colors={colors} />
              <OfferTable offers={offers} colors={colors} />
              <Pagination colors={colors} />
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl font-semibold mb-4" style={{ color: colors.primaryBlack }}>You haven't created any offers yet.</p>
              <button className="px-6 py-3 rounded-full bg-black text-white font-bold hover:bg-gray-800 transition-colors">
                Create your first offer
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
