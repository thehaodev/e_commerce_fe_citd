import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { navLinks as buyerNavLinks } from "../../data/buyerHomeMock";
import NotificationsDropdown from "../notifications/NotificationsDropdown";

const getDisplayName = (user) => {
  if (!user) return "";
  return (
    user.full_name ||
    user.company_name ||
    user.name ||
    user.email ||
    user.username ||
    ""
  );
};

const getInitial = (user) => {
  const name = getDisplayName(user);
  return name ? name.charAt(0).toUpperCase() : "U";
};

const Avatar = ({ user, className }) => {
  const initial = getInitial(user);
  const url = user?.avatar_url || user?.avatarUrl;

  if (url) {
    return (
      <img
        src={url}
        alt={getDisplayName(user) || "User avatar"}
        className={`h-9 w-9 rounded-full object-cover ${className || ""}`}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }

  return (
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${className || ""} bg-gray-100 text-gray-700`}
    >
      {initial}
    </div>
  );
};

const sellerNavLinks = [
  { label: "Home", to: "/seller/home" },
  { label: "My Offers", to: "/seller/offers" },
  { label: "Create Offer", to: "/seller/offers/new" },
];

const providerNavLinks = [
  { label: "Home", to: "/provider/home" },
  { label: "Service Requests", to: "/provider/service-requests" },
  { label: "Private Offers", to: "/provider/private-offers" },
  { label: "Proposals", to: "/provider/proposals" },
];

const headerVariants = {
  BUYER: {
    brandLabel: "CABIN.",
    brandIcon: null,
    brandBadge: "",
    brandText: "text-gray-900",
    navLinks: buyerNavLinks,
    navHover: "hover:text-gray-900",
    navActive: "text-gray-900 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-yellow-300",
    searchPlaceholder: "Search ...",
    searchField: "bg-[#f7e9b0] focus:ring-2 focus:ring-yellow-300 focus:bg-[#f7e9b0]",
    iconButtonAccent: "border-amber-100 hover:border-amber-200 hover:text-amber-700",
    profileAvatar: "bg-amber-100 text-amber-800",
    dropdownAction: "text-amber-700 hover:bg-amber-50",
    badgeClass: "bg-amber-500 text-black",
    headerBorder: "border-amber-50",
    panelBorder: "border-amber-50",
    panelDivider: "divide-amber-50",
    actionText: "text-amber-600",
    notificationDot: "bg-amber-500",
    notificationHover: "hover:bg-amber-50/60",
  },
  SELLER: {
    brandLabel: "Seller Center",
    brandIcon: "S",
    brandBadge: "bg-gradient-to-br from-indigo-500 to-sky-500 text-white",
    brandText: "text-slate-900",
    navLinks: sellerNavLinks,
    navHover: "hover:bg-indigo-50 hover:text-indigo-700",
    searchPlaceholder: "Search buyer requests or offers...",
    searchField:
      "border-slate-200 bg-slate-50/70 focus:border-indigo-400 focus:ring-indigo-100",
    iconButtonAccent: "border-slate-200 hover:border-indigo-200 hover:text-indigo-700",
    profileAvatar: "bg-indigo-100 text-indigo-800",
    dropdownAction: "text-indigo-700 hover:bg-indigo-50",
    badgeClass: "bg-indigo-500 text-white",
    headerBorder: "border-slate-200",
    panelBorder: "border-indigo-50",
    panelDivider: "divide-indigo-50",
    actionText: "text-indigo-600",
    notificationDot: "bg-indigo-500",
    notificationHover: "hover:bg-indigo-50",
  },
  PROVIDER: {
    brandLabel: "Provider Desk",
    brandIcon: "P",
    brandBadge: "bg-gradient-to-br from-emerald-400 to-teal-500 text-white",
    brandText: "text-slate-900",
    navLinks: providerNavLinks,
    navHover: "hover:bg-emerald-50 hover:text-emerald-700",
    searchPlaceholder: "Search service requests or offers...",
    searchField:
      "border-emerald-100 bg-emerald-50/60 focus:border-emerald-400 focus:ring-emerald-100",
    iconButtonAccent: "border-emerald-100 hover:border-emerald-200 hover:text-emerald-700",
    profileAvatar: "bg-emerald-100 text-emerald-800",
    dropdownAction: "text-emerald-700 hover:bg-emerald-50",
    badgeClass: "bg-emerald-500 text-white",
    headerBorder: "border-emerald-100",
    panelBorder: "border-emerald-50",
    panelDivider: "divide-emerald-50",
    actionText: "text-emerald-600",
    notificationDot: "bg-emerald-500",
    notificationHover: "hover:bg-emerald-50",
  },
  DEFAULT: {
    brandLabel: "Dashboard",
    brandIcon: "D",
    brandBadge: "bg-gradient-to-br from-slate-500 to-slate-700 text-white",
    brandText: "text-slate-900",
    navLinks: [],
    navHover: "hover:bg-slate-50 hover:text-slate-700",
    searchPlaceholder: "Search...",
    searchField:
      "border-slate-200 bg-slate-50/70 focus:border-slate-400 focus:ring-slate-100",
    iconButtonAccent: "border-slate-200 hover:border-slate-300 hover:text-slate-700",
    profileAvatar: "bg-slate-100 text-slate-800",
    dropdownAction: "text-slate-700 hover:bg-slate-50",
    badgeClass: "bg-slate-500 text-white",
    headerBorder: "border-slate-200",
    panelBorder: "border-slate-200",
    panelDivider: "divide-slate-200",
    actionText: "text-slate-600",
    notificationDot: "bg-slate-500",
    notificationHover: "hover:bg-slate-50",
  },
};

const AppHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);

  const userLabel = useMemo(() => getDisplayName(user), [user]);
  const roleKey = (user?.role || "").toUpperCase();
  const userRole = roleKey || "User";
  const variant = headerVariants[roleKey] || headerVariants.DEFAULT;
  const isBuyer = roleKey === "BUYER";
  const homeLink = variant.navLinks?.[0]?.to || "/";

  if (!user) return null;

  const handleProfile = () => {
    setShowProfile(false);
    navigate("/profile");
  };

  const handleLogout = () => {
    setShowProfile(false);
    logout?.();
    navigate("/", { replace: true });
  };

  const navIsActive = (path) => {
    if (!path) return false;
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={`app-header sticky top-0 z-30 border-b bg-white/95 backdrop-blur ${
        isBuyer ? "border-amber-100" : `shadow-sm ${variant.headerBorder}`
      }`}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center gap-3 py-3 md:gap-4">
          <Link to={homeLink} className="flex items-center gap-2">
            {isBuyer ? (
              <span className="text-xl font-black tracking-tight text-gray-900">CABIN.</span>
            ) : (
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl font-semibold ${variant.brandBadge}`}
              >
                {variant.brandIcon || getInitial(user)}
              </div>
            )}
            {!isBuyer && (
              <span className={`text-lg font-semibold ${variant.brandText}`}>{variant.brandLabel}</span>
            )}
          </Link>

          <div className="hidden flex-1 items-center gap-3 md:flex">
            <div className="relative w-full">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder={variant.searchPlaceholder}
                className={`w-full rounded-full border-none px-12 py-3 text-sm text-gray-900 shadow-inner transition focus:outline-none ${variant.searchField}`}
              />
            </div>
            {isBuyer && (
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-900 text-yellow-200 transition hover:translate-y-[-1px] hover:opacity-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M3 5h18M7 12h10M10 19h4" />
                </svg>
              </button>
            )}
          </div>

          <nav className="hidden items-center gap-1 text-sm font-semibold text-gray-700 lg:flex">
            {(variant.navLinks || []).map((link) => (
              <Link
                key={link.label}
                to={link.to || link.href}
                className={`relative rounded-full px-3 py-2 transition ${
                  navIsActive(link.to || link.href)
                    ? `${variant.navActive || ""} ${isBuyer ? "text-gray-900" : ""}`
                    : `${variant.navHover} text-gray-600`
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <NotificationsDropdown variant={variant} />

            <div className="relative z-30 pointer-events-auto">
              <button
                onClick={() => setShowProfile((prev) => !prev)}
                className={`flex items-center gap-2 rounded-full border bg-white px-2.5 py-1.5 shadow-sm transition ${variant.iconButtonAccent}`}
              >
                <Avatar user={user} className={variant.profileAvatar} />
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold text-gray-900">{userLabel}</p>
                  <p className="text-xs text-gray-500">{userRole}</p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showProfile && (
                <div
                  className={`absolute right-0 mt-3 w-56 rounded-2xl border bg-white shadow-xl ${variant.panelBorder}`}
                >
                  <div className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">{userLabel}</p>
                    <p className="text-xs text-gray-500">{userRole}</p>
                  </div>
                  <div className={`divide-y text-sm ${variant.panelDivider}`}>
                    <button
                      type="button"
                      onClick={handleProfile}
                      className={`block w-full text-left px-4 py-2.5 ${variant.dropdownAction}`}
                    >
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className={`block w-full text-left px-4 py-2.5 ${variant.dropdownAction}`}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="block pb-4 md:hidden">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder={variant.searchPlaceholder}
              className={`w-full rounded-full border-none px-12 py-3 text-sm text-gray-900 shadow-inner transition focus:outline-none ${variant.searchField}`}
            />
            {isBuyer && (
              <button
                type="button"
                className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-gray-900 text-yellow-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M3 5h18M7 12h10M10 19h4" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
