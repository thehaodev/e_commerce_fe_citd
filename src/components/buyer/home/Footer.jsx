const Footer = () => {
  return (
    <footer className="mt-10 border-t border-gray-100 bg-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-400 text-white font-semibold">
              B
            </div>
            <p className="text-lg font-semibold text-gray-900">Buyer Hub</p>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Discover and manage offers tailored to your supply chain needs.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Products</p>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li>
              <a className="hover:text-indigo-600" href="#">
                Offers
              </a>
            </li>
            <li>
              <a className="hover:text-indigo-600" href="#">
                Requests
              </a>
            </li>
            <li>
              <a className="hover:text-indigo-600" href="#">
                Categories
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Company</p>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li>
              <a className="hover:text-indigo-600" href="#">
                About
              </a>
            </li>
            <li>
              <a className="hover:text-indigo-600" href="#">
                Careers
              </a>
            </li>
            <li>
              <a className="hover:text-indigo-600" href="#">
                Contact
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Support</p>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li>
              <a className="hover:text-indigo-600" href="#">
                Help Center
              </a>
            </li>
            <li>
              <a className="hover:text-indigo-600" href="#">
                Terms
              </a>
            </li>
            <li>
              <a className="hover:text-indigo-600" href="#">
                Privacy
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-100">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Buyer Hub. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Secure & Verified Network
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
