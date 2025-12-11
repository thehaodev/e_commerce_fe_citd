import React from "react";
import useAuth from "../../hooks/useAuth";

const SellerShell = ({ children }) => {
  const { user } = useAuth();

  const initial =
    (user?.company_name?.[0] ||
      user?.full_name?.[0] ||
      user?.name?.[0] ||
      user?.email?.[0] ||
      "S")?.toUpperCase();

  return (
    <div className="min-h-screen flex bg-[#F5F5F5] text-slate-900">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col justify-between border-r border-slate-200 bg-white md:flex">
        <div>
          <div className="px-6 py-6">
            <span className="block text-xl font-extrabold tracking-tight text-slate-900">
              CABIN.
            </span>
          </div>

          <nav className="mt-4 space-y-2 text-sm font-semibold">
            <button className="w-full flex items-center gap-3 px-6 py-3 rounded-r-full bg-slate-900 text-white">
              <span>Manage Offer</span>
            </button>
            <button className="w-full flex items-center gap-3 px-6 py-3 text-slate-500 transition hover:text-slate-900">
              <span>Setting</span>
            </button>
          </nav>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center justify-between">
            <span>Workspace</span>
            <span className="text-slate-800 font-medium">Matrix Domain ▾</span>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        <header className="h-20 bg-white flex items-center justify-between px-6 md:px-8 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 md:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-5 w-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-slate-900">Manage Offer</h1>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-400 flex items-center justify-center text-sm font-semibold text-white">
                {initial}
              </div>
              <div className="text-right leading-tight">
                <div className="text-sm font-semibold text-slate-900">
                  {user.company_name || user.full_name || user.name || "Seller Company Inc."}
                </div>
                <div className="text-xs text-slate-500">
                  {user.email || "seller@company.com"}
                </div>
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default SellerShell;
