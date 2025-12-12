import { useState } from "react";
import { Link } from "react-router-dom";
import { navLinks, notifications, userProfile } from "../../../data/buyerHomeMock";

const NavBar = () => {
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur shadow-sm border-b border-amber-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-300 text-black font-semibold">
            B
          </div>
          <span className="text-lg font-semibold text-gray-900">
            Buyer Hub
          </span>
        </div>

        <div className="hidden flex-1 items-center gap-4 md:flex">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search offers, suppliers, categories..."
              className="w-full rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-2.5 pr-10 text-sm text-gray-800 transition focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-100"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                />
              </svg>
            </span>
          </div>
        </div>

        <nav className="hidden items-center gap-4 text-sm font-medium text-gray-800 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to || link.href}
              className="rounded-full px-3 py-2 transition hover:bg-amber-50 hover:text-amber-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowNotif((prev) => !prev)}
              className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-amber-100 bg-white shadow-sm transition hover:border-amber-200 hover:text-amber-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-semibold text-black">
                3
              </span>
            </button>
            {showNotif && (
              <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-amber-50 bg-white shadow-xl">
                <div className="flex items-center justify-between px-4 py-3">
                  <p className="text-sm font-semibold text-gray-900">
                    Notifications
                  </p>
                  <button className="text-xs text-amber-600 hover:underline">
                    View all
                  </button>
                </div>
                <div className="divide-y divide-amber-50">
                  {notifications.map((item) => (
                    <div key={item.id} className="flex gap-3 px-4 py-3 hover:bg-amber-50/60">
                      <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-amber-500" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-600">{item.description}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-wide text-gray-400">
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowProfile((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border border-amber-100 bg-white px-2.5 py-1.5 shadow-sm transition hover:border-amber-200"
            >
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="h-9 w-9 rounded-full object-cover"
              />
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-gray-900">
                  {userProfile.name}
                </p>
                <p className="text-xs text-gray-500">{userProfile.role}</p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showProfile && (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-amber-50 bg-white shadow-xl">
                <div className="px-4 py-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {userProfile.name}
                  </p>
                  <p className="text-xs text-gray-500">{userProfile.role}</p>
                </div>
                <div className="divide-y divide-amber-50 text-sm">
                  <a className="block px-4 py-2.5 hover:bg-amber-50" href="#">
                    Profile
                  </a>
                  <a className="block px-4 py-2.5 hover:bg-amber-50" href="#">
                    Settings
                  </a>
                  <a className="block px-4 py-2.5 text-amber-700 hover:bg-amber-50" href="#">
                    Logout
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="block px-4 pb-3 md:hidden">
        <div className="relative">
          <input
            type="text"
            placeholder="Search offers, suppliers..."
            className="w-full rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-2.5 pr-10 text-sm text-gray-800 transition focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
              />
            </svg>
          </span>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
