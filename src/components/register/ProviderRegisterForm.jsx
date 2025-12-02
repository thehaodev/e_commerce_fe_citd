import React, { useState } from "react";

const ProviderRegisterForm = ({ onSubmit }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] = useState("Freight Forwarding");
  const [operationCountries, setOperationCountries] = useState([
    "Vietnam",
    "Singapore",
  ]);
  const [newCountry, setNewCountry] = useState("");
  const [businessLicenseUrl, setBusinessLicenseUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddCountry = () => {
    const value = newCountry.trim();
    if (!value || operationCountries.includes(value)) {
      return;
    }
    setOperationCountries([...operationCountries, value]);
    setNewCountry("");
  };

  const handleRemoveCountry = (name) => {
    setOperationCountries(operationCountries.filter((c) => c !== name));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !email.trim() ||
      !password.trim() ||
      !companyName.trim() ||
      !contactPerson.trim() ||
      !phone.trim() ||
      !serviceType.trim() ||
      !businessLicenseUrl.trim() ||
      operationCountries.length === 0
    ) {
      setError(
        "Please fill in all required fields and add at least one operation country."
      );
      return;
    }

    setLoading(true);
    try {
      await onSubmit?.({
        email,
        password,
        company_name: companyName,
        contact_person: contactPerson,
        phone,
        service_type: serviceType,
        operation_countries: operationCountries,
        business_license_url: businessLicenseUrl,
        website,
      });
    } catch (err) {
      setError(err?.message || "Unable to create provider account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-yellow outline-none"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-yellow outline-none"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide pt-2">
          Service Details
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name
          </label>
          <input
            type="text"
            placeholder="Logistics Co."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-yellow outline-none"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Person
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-yellow outline-none"
            required
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
          />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-yellow outline-none"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Type
            </label>
            <div className="relative">
              <select
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-yellow outline-none appearance-none bg-white"
                required
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
              >
                <option>Freight Forwarding</option>
                <option>Warehousing</option>
                <option>Customs Brokerage</option>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operation Countries
            </label>
            <div className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-primary-yellow focus-within:border-transparent bg-white flex flex-wrap gap-2">
              {operationCountries.map((country) => (
                <span
                  key={country}
                  className="bg-gray-100 text-xs font-bold px-2 py-1 rounded flex items-center"
                >
                  {country}
                  <button
                    type="button"
                    className="ml-1 hover:text-red-500"
                    onClick={() => handleRemoveCountry(country)}
                  >
                    &times;
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="Add..."
                className="text-sm outline-none flex-1 min-w-[60px]"
                value={newCountry}
                onChange={(e) => setNewCountry(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCountry();
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business License URL
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              https://
            </span>
            <input
              type="text"
              placeholder="cloud-storage.com/my-license.pdf"
              className="flex-1 px-4 py-3 rounded-none rounded-r-lg border border-gray-300 focus:ring-2 focus:ring-primary-yellow outline-none"
              required
              value={businessLicenseUrl}
              onChange={(e) => setBusinessLicenseUrl(e.target.value)}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Please provide a direct link to your business license document.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website (Optional)
          </label>
          <input
            type="url"
            placeholder="www.yourcompany.com"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-yellow outline-none"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
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
        {loading ? "Creating account..." : "Join as Service Provider"}
      </button>
    </form>
  );
};

export default ProviderRegisterForm;
