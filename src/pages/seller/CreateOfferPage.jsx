import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiLoader } from "react-icons/fi";
import ImageUploader from "../../components/seller/offers/ImageUploader";
import SuccessModal from "../../components/seller/offers/SuccessModal";
import { createOffer } from "../../api/offerApi";

const incotermOptions = ["EXW", "FCA", "FOB"];

const computeMinDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  return d.toISOString().split("T")[0];
};

const CreateOfferPage = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [minDate, setMinDate] = useState(computeMinDate());
  const [form, setForm] = useState({
    product_name: "",
    description: "",
    quantity: "",
    price: "",
    seller_incoterm: "EXW",
    port_of_loading: "",
    cargo_ready_date: computeMinDate(),
    payment_terms: "",
  });

  useEffect(() => {
    setMinDate(computeMinDate());
  }, []);

  const imageUrls = useMemo(
    () =>
      (images || [])
        .map((img) => {
          if (typeof img === "string") return img;
          if (img?.url) return img.url;
          return "";
        })
        .filter(Boolean),
    [images]
  );

  const hasUploading = useMemo(() => (images || []).some((img) => img?.uploading), [images]);

  const fieldErrors = useMemo(() => {
    const errors = {};
    if (!form.product_name.trim()) errors.product_name = "Product name is required";
    if (form.product_name.length > 100) errors.product_name = "Max 100 characters";
    if (!form.quantity || Number(form.quantity) <= 0) errors.quantity = "Quantity must be > 0";
    if (!form.price || Number(form.price) <= 0) errors.price = "Price must be > 0";
    if (!form.seller_incoterm) errors.seller_incoterm = "Select an incoterm";
    if (!incotermOptions.includes(form.seller_incoterm))
      errors.seller_incoterm = "Invalid incoterm";
    if (!form.port_of_loading.trim()) errors.port_of_loading = "Port of loading is required";
    if (!form.cargo_ready_date) errors.cargo_ready_date = "Cargo ready date is required";
    if (form.cargo_ready_date && form.cargo_ready_date < minDate) {
      errors.cargo_ready_date = `Earliest date is ${minDate}`;
    }
    if (hasUploading) errors.images = "Please wait for uploads to finish";
    if (imageUrls.length < 1 && !hasUploading) errors.images = "At least 1 image is required";
    if (imageUrls.length > 5) errors.images = "Maximum 5 images allowed";
    return errors;
  }, [form, hasUploading, imageUrls.length, minDate]);

  const isValid = Object.keys(fieldErrors).length === 0;

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePriceBlur = () => {
    const num = Number(form.price);
    if (!Number.isNaN(num) && num > 0) {
      setForm((prev) => ({ ...prev, price: num.toFixed(2) }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    setApiError("");
    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
        price: Number(form.price),
        images: imageUrls.map((url) => ({ url })),
      };
      await createOffer(payload);
      setSuccessOpen(true);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Please try again later.";
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const goToList = () => navigate("/seller/offers");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white/90 backdrop-blur px-6 py-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-amber-700"
        >
          <FiArrowLeft /> Back
        </button>
        <div>
          <p className="text-xs font-semibold text-amber-600 uppercase">Seller</p>
          <h1 className="text-2xl font-bold text-slate-900">Create Offer</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-6">
        {apiError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                  Product Info
                </p>
                <h2 className="text-lg font-bold text-slate-900">Details</h2>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-800">
                  Product name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.product_name}
                  onChange={handleChange("product_name")}
                  maxLength={100}
                  className={`w-full rounded-xl border px-4 py-3 text-slate-900 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 ${
                    fieldErrors.product_name ? "border-rose-300" : "border-slate-200"
                  }`}
                  placeholder="e.g., Stainless Steel Sheets"
                />
                {fieldErrors.product_name && (
                  <p className="text-sm text-rose-600">{fieldErrors.product_name}</p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-800">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={handleChange("description")}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  placeholder="Add product specifications, quality, packaging, etc."
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                  Media
                </p>
                <h2 className="text-lg font-bold text-slate-900">Images</h2>
              </div>
              <ImageUploader
                value={images}
                onChange={setImages}
                error={fieldErrors.images}
              />
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                  Commercials
                </p>
                <h2 className="text-lg font-bold text-slate-900">Pricing</h2>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-800">
                  Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={handleChange("quantity")}
                  className={`w-full rounded-xl border px-4 py-3 text-slate-900 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 ${
                    fieldErrors.quantity ? "border-rose-300" : "border-slate-200"
                  }`}
                  placeholder="Enter quantity"
                />
                {fieldErrors.quantity && (
                  <p className="text-sm text-rose-600">{fieldErrors.quantity}</p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-800">
                  Price <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange("price")}
                  onBlur={handlePriceBlur}
                  className={`w-full rounded-xl border px-4 py-3 text-slate-900 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 ${
                    fieldErrors.price ? "border-rose-300" : "border-slate-200"
                  }`}
                  placeholder="Enter price"
                />
                {fieldErrors.price && (
                  <p className="text-sm text-rose-600">{fieldErrors.price}</p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-800">
                  Incoterm <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.seller_incoterm}
                  onChange={handleChange("seller_incoterm")}
                  className={`w-full rounded-xl border px-4 py-3 text-slate-900 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 ${
                    fieldErrors.seller_incoterm ? "border-rose-300" : "border-slate-200"
                  }`}
                >
                  {incotermOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {fieldErrors.seller_incoterm && (
                  <p className="text-sm text-rose-600">{fieldErrors.seller_incoterm}</p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-800">
                  Payment terms
                </label>
                <input
                  type="text"
                  value={form.payment_terms}
                  onChange={handleChange("payment_terms")}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  placeholder="e.g., 30% deposit, balance on BL"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                  Logistics
                </p>
                <h2 className="text-lg font-bold text-slate-900">Shipping</h2>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-800">
                  Port of loading <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.port_of_loading}
                  onChange={handleChange("port_of_loading")}
                  className={`w-full rounded-xl border px-4 py-3 text-slate-900 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 ${
                    fieldErrors.port_of_loading ? "border-rose-300" : "border-slate-200"
                  }`}
                  placeholder="e.g., Ho Chi Minh Port"
                />
                {fieldErrors.port_of_loading && (
                  <p className="text-sm text-rose-600">{fieldErrors.port_of_loading}</p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-800">
                  Cargo ready date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.cargo_ready_date}
                  min={minDate}
                  onChange={handleChange("cargo_ready_date")}
                  className={`w-full rounded-xl border px-4 py-3 text-slate-900 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 ${
                    fieldErrors.cargo_ready_date ? "border-rose-300" : "border-slate-200"
                  }`}
                />
                <p className="text-xs text-slate-600">
                  Earliest allowed: <span className="font-semibold">{minDate}</span>
                </p>
                {fieldErrors.cargo_ready_date && (
                  <p className="text-sm text-rose-600">{fieldErrors.cargo_ready_date}</p>
                )}
              </div>
            </div>
          </section>

          <div className="sticky bottom-0 left-0 right-0 border-t bg-white px-6 py-4 shadow-sm flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/seller/offers")}
              className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:border-amber-300"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || submitting}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-slate-900 shadow transition ${
                !isValid || submitting
                  ? "bg-amber-300/70 cursor-not-allowed opacity-80"
                  : "bg-amber-500 hover:bg-amber-600"
              }`}
            >
              {submitting && (
                <FiLoader className="h-4 w-4 animate-spin text-slate-900" />
              )}
              Create Offer
            </button>
          </div>
        </form>
      </main>

      <SuccessModal
        open={successOpen}
        title="Offer created"
        message="Offer created and pending admin approval."
        onPrimary={goToList}
      />
    </div>
  );
};

export default CreateOfferPage;
