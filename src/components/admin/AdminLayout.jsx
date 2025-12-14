import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiBell, FiLogOut, FiSearch } from "react-icons/fi";
import useAuth from "../../hooks/useAuth";

const navItems = [
  { label: "Dashboard", path: "/admin/dashboard", disabled: true },
  { label: "Offer Moderation", path: "/admin/offers" },
  { label: "Service Requests", path: "/admin/service-requests", disabled: true },
  { label: "User Directory", path: "/admin/users", disabled: true },
  { label: "System Settings", path: "/admin/settings", disabled: true },
];

const AdminLayout = ({ breadcrumb = ["Admin"], pageTitle = "Admin", children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentPath = location.pathname;

  const userName =
    user?.full_name || user?.company_name || user?.name || user?.email || "Admin User";
  const userInitial = (userName?.[0] || "A").toUpperCase();

  const breadcrumbLabel = Array.isArray(breadcrumb) ? breadcrumb.join(" / ") : breadcrumb;

  const handleNav = (item) => {
    if (item.disabled || !item.path) return;
    navigate(item.path);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-slate-900 flex">
      <aside className="hidden md:flex w-64 flex-col justify-between border-r border-slate-200 bg-white">
        <div>
          <div className="px-6 py-6 flex items-center gap-3">
            <span className="text-xl font-extrabold tracking-tight text-slate-900">CABIN.</span>
            <span className="rounded-full bg-slate-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              Admin
            </span>
          </div>
          <nav className="mt-2 space-y-1 text-sm font-semibold">
            {navItems.map((item) => {
              const isActive = item.path && currentPath.startsWith(item.path);
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNav(item)}
                  disabled={item.disabled}
                  className={`w-full flex items-center gap-3 px-6 py-3 text-left transition ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  } ${item.disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="px-6 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-semibold">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 leading-tight truncate">{userName}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="truncate">{user?.email || "Administrator"}</span>
                  <span className="inline-flex shrink-0 items-center rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-[11px] uppercase tracking-wide text-slate-700">
                    Admin
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            >
              <FiLogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-4 shadow-sm md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {breadcrumbLabel}
            </p>
            <h1 className="text-xl font-bold text-slate-900">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search across admin..."
                readOnly
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-10 py-2 text-sm text-slate-800 shadow-inner"
              />
            </div>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
            >
              <FiBell className="h-5 w-5" />
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
