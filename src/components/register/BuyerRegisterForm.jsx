import React, { useState } from "react";

const BuyerRegisterForm = ({ onSubmit }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !email.trim() ||
      !password.trim() ||
      !fullName.trim() ||
      !phone.trim() ||
      !country.trim() ||
      !companyName.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit?.({
        email,
        password,
        full_name: fullName,
        phone,
        country,
        company_name: companyName,
      });
    } catch (err) {
      setError(err?.message || "Unable to create buyer account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            placeholder="name@company.com"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-transparent outline-none transition-all"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-transparent outline-none transition-all"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-transparent outline-none transition-all"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 my-4"></div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-transparent outline-none transition-all"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <div className="relative">
              <select
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-transparent outline-none appearance-none bg-white"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="" disabled>
                  Select country
                </option>
                <option value="US">United States</option>
                <option value="VN">Vietnam</option>
                <option value="SG">Singapore</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name
          </label>
          <input
            type="text"
            placeholder="Acme Corp"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-transparent outline-none transition-all"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-white font-extrabold py-3.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 mt-4 disabled:opacity-70 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-300"
        disabled={loading}
      >
        {loading ? "Creating account..." : "Create Buyer Account"}
      </button>
    </form>
  );
};

export default BuyerRegisterForm;
