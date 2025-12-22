const Footer = () => {
  return (
    <footer className="mt-14 bg-[#0b1b34] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <p className="text-xl font-black tracking-tight">CABIN.</p>
            <p className="text-sm text-slate-300">
              Discover and manage offers tailored to your supply chain needs.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-200">Products</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>
                <a className="hover:text-yellow-300" href="#">
                  Offers
                </a>
              </li>
              <li>
                <a className="hover:text-yellow-300" href="#">
                  Requests
                </a>
              </li>
              <li>
                <a className="hover:text-yellow-300" href="#">
                  Categories
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-200">Company</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>
                <a className="hover:text-yellow-300" href="#">
                  About
                </a>
              </li>
              <li>
                <a className="hover:text-yellow-300" href="#">
                  Careers
                </a>
              </li>
              <li>
                <a className="hover:text-yellow-300" href="#">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-200">Support</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>
                <a className="hover:text-yellow-300" href="#">
                  Help Center
                </a>
              </li>
              <li>
                <a className="hover:text-yellow-300" href="#">
                  Terms
                </a>
              </li>
              <li>
                <a className="hover:text-yellow-300" href="#">
                  Privacy
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 bg-[#0a172c]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-slate-300">
          <p>© {new Date().getFullYear()} CABIN. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Secure & Verified Network
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
