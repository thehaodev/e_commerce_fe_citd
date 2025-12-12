import React from "react";
import { FiChevronRight, FiLogOut } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import AppHeader from "./AppHeader";

const navItems = [
  { label: "Dashboard", path: "/provider/home" },
  { label: "Service Requests", path: "/provider/service-requests" },
  { label: "Private Offers", path: "/provider/private-offers" },
  { label: "Proposals", path: "/provider/proposals" },
];

const ProviderLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const displayName =
    user?.full_name || user?.company_name || user?.name || user?.email || "Provider";

  const subtitle = location.pathname.includes("service-requests")
    ? "Service Requests"
    : location.pathname.includes("private-offers")
      ? "Private Offers"
      : location.pathname.includes("proposals")
        ? "Proposals"
        : "Provider Workspace";

  const handleNav = (item) => {
    if (item.disabled) return;
    if (item.path && item.path !== location.pathname) {
      navigate(item.path);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AppHeader />

      <div className="border-b border-emerald-50 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Service Provider Dashboard
            </p>
            <div className="flex items-center gap-2 text-slate-900">
          <h1 className="text-2xl font-bold">Provider Workspace</h1>
              <FiChevronRight className="hidden text-emerald-400 md:block" />
              <span className="hidden text-sm font-semibold text-emerald-700 md:block">
                {subtitle}
              </span>
            </div>
            <p className="text-sm text-slate-600">
              Manage logistics requests, private offers, and proposals.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm">
            <div className="text-right leading-tight">
              <p className="font-semibold text-slate-900">{displayName}</p>
              <p className="text-xs text-slate-600">{user?.email || user?.username || "Logged in"}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <FiLogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-4 pb-3">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNav(item)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:text-emerald-700"
                } ${item.disabled ? "cursor-not-allowed opacity-60" : ""}`}
                aria-disabled={item.disabled}
              >
                <span>{item.label}</span>
                {item.disabled && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <main className="flex-1">{children}</main>
    </div>
  );
};

export default ProviderLayout;
