import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiCamera,
  FiCheckCircle,
  FiMail,
  FiPhone,
  FiRefreshCw,
  FiShield,
  FiUser,
  FiX,
} from "react-icons/fi";
import AppHeader from "../../components/layout/AppHeader";
import { getMe, updateMe } from "../../api/userApi";
import { uploadImage } from "../../api/uploadApi";
import useAuthStore from "../../store/authStore";
import mapBackendErrors from "../../utils/mapBackendErrors";

const normalizeFormState = (data = {}) => ({
  full_name: data.full_name ?? "",
  phone: data.phone ?? "",
  company_name: data.company_name ?? "",
  avatar_url: data.avatar_url ?? "",
});

const initialsForUser = (user) => {
  const name =
    user?.full_name ||
    user?.company_name ||
    user?.name ||
    user?.email ||
    user?.username ||
    "";
  return name ? name.charAt(0).toUpperCase() : "U";
};

const ToastStack = ({ toasts, onDismiss }) => {
  if (!toasts?.length) return null;

  const toneClass = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-rose-200 bg-rose-50 text-rose-800",
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${toneClass[toast.tone] || toneClass.success}`}
        >
          {toast.tone === "error" ? (
            <FiAlertCircle className="h-5 w-5" />
          ) : (
            <FiCheckCircle className="h-5 w-5" />
          )}
          <span className="flex-1">{toast.message}</span>
          <button
            type="button"
            onClick={() => onDismiss?.(toast.id)}
            className="text-inherit hover:opacity-70"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [formState, setFormState] = useState(normalizeFormState());
  const [initialState, setInitialState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [toasts, setToasts] = useState([]);

  const accessToken = useAuthStore((state) => state.accessToken);
  const setAuth = useAuthStore((state) => state.setAuth);

  const showToast = useCallback((message, tone = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3600);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const syncStoreUser = useCallback(
    (userData) => {
      if (!userData) return;
      setAuth({ user: userData, accessToken });
    },
    [accessToken, setAuth]
  );

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    setFieldErrors({});
    try {
      const res = await getMe();
      const data = res?.data ?? res;
      setProfile(data);
      const normalized = normalizeFormState(data);
      setFormState(normalized);
      setInitialState(normalized);
      syncStoreUser(data);
    } catch (err) {
      const message =
        err?.response?.data?.detail || err?.message || "Unable to load your profile.";
      setError(message);
      showToast(message, "error");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [showToast, syncStoreUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const isDirty = useMemo(() => {
    if (!initialState) return false;
    return ["full_name", "phone", "company_name", "avatar_url"].some(
      (key) => (formState[key] ?? "") !== (initialState[key] ?? "")
    );
  }, [formState, initialState]);

  const nameTooLong = formState.full_name && formState.full_name.length > 100;
  const phoneFormatIssue =
    formState.phone && !/^[0-9+()\-\s]{6,20}$/.test(formState.phone.trim());

  const onInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const uploadResult = await uploadImage(file);
      const nextUrl =
        typeof uploadResult === "string"
          ? uploadResult
          : uploadResult?.url || uploadResult?.secure_url || uploadResult?.data?.url;

      if (!nextUrl) {
        showToast("Upload finished but image URL was not returned. Please try again.", "error");
        return;
      }

      setFormState((prev) => ({ ...prev, avatar_url: nextUrl }));
      showToast("Avatar uploaded. Remember to save your profile.");
    } catch (err) {
      const message = err?.message || "Failed to upload image. Please try again.";
      setError((prev) => prev || message);
      showToast(message, "error");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!isDirty || saving || nameTooLong) return;
    setSaving(true);
    setError("");
    setFieldErrors({});

    try {
      const payload = {
        full_name: formState.full_name?.trim() || null,
        phone: formState.phone?.trim() || null,
        company_name: formState.company_name?.trim() || null,
        avatar_url: formState.avatar_url || null,
      };

      const res = await updateMe(payload);
      const data = res?.data ?? res;
      const normalized = normalizeFormState(data);

      setProfile(data);
      setFormState(normalized);
      setInitialState(normalized);
      syncStoreUser(data);
      showToast("Profile updated successfully.");
    } catch (err) {
      const message =
        err?.response?.data?.detail || err?.message || "Could not update profile. Please try again.";
      setError(message);
      setFieldErrors(mapBackendErrors(err));
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (initialState) {
      setFormState(initialState);
      setFieldErrors({});
      setError("");
    }
  };

  const displayName =
    formState.full_name ||
    profile?.full_name ||
    profile?.company_name ||
    profile?.email ||
    "Your profile";

  const avatarUrl = formState.avatar_url || profile?.avatar_url;
  const roleLabel = (profile?.role || "").toString().toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Account
            </p>
            <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
            <p className="text-sm text-slate-600">
              View and update your contact details and avatar.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchProfile}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiRefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || saving || nameTooLong}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <FiRefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <FiCheckCircle className="h-4 w-4" />
              )}
              Save changes
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <FiAlertCircle className="mt-0.5 h-5 w-5" />
            <div className="flex-1">
              <p className="font-semibold">We hit a snag.</p>
              <p className="text-xs text-rose-700">{error}</p>
            </div>
            {!loading && (
              <button
                type="button"
                onClick={fetchProfile}
                className="text-xs font-semibold text-rose-800 underline"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="h-24 w-24 rounded-full bg-slate-100 animate-pulse" />
              <div className="mt-4 h-4 w-40 rounded bg-slate-100 animate-pulse" />
              <div className="mt-2 h-3 w-28 rounded bg-slate-100 animate-pulse" />
            </div>
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="h-3 w-24 rounded bg-slate-100 animate-pulse" />
                  <div className="h-11 w-full rounded-xl bg-slate-100 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : !profile ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
            <p className="text-lg font-semibold text-slate-900">Profile unavailable</p>
            <p className="text-sm text-slate-600">
              We could not load your information. Please try refreshing.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="relative">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-24 w-24 rounded-full object-cover ring-4 ring-emerald-50"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-3xl font-bold text-slate-500 ring-4 ring-emerald-50">
                      {initialsForUser(profile)}
                    </div>
                  )}
                  <label
                    className="absolute bottom-0 right-0 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-emerald-600 shadow-md ring-1 ring-emerald-100 transition hover:text-emerald-700"
                    title="Upload avatar"
                  >
                    {uploading ? <FiRefreshCw className="h-4 w-4 animate-spin" /> : <FiCamera className="h-4 w-4" />}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleAvatarUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">{displayName}</p>
                  <p className="text-sm text-slate-600">{profile.email}</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <FiShield className="h-4 w-4" />
                  {roleLabel || "USER"}
                </span>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">Full name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      maxLength={150}
                      value={formState.full_name}
                      onChange={onInputChange("full_name")}
                      className={`w-full rounded-xl border px-10 py-2.5 text-sm text-slate-900 shadow-inner transition focus:border-emerald-200 focus:ring-2 focus:ring-emerald-100 ${
                        fieldErrors.full_name || nameTooLong ? "border-rose-300" : "border-slate-200"
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {nameTooLong && (
                    <p className="text-xs text-rose-600">
                      Full name is too long. Please keep it under 100 characters.
                    </p>
                  )}
                  {fieldErrors.full_name && (
                    <p className="text-xs text-rose-600">{fieldErrors.full_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">Phone</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={formState.phone}
                      onChange={onInputChange("phone")}
                      className={`w-full rounded-xl border px-10 py-2.5 text-sm text-slate-900 shadow-inner transition focus:border-emerald-200 focus:ring-2 focus:ring-emerald-100 ${
                        fieldErrors.phone ? "border-rose-300" : "border-slate-200"
                      }`}
                      placeholder="Add a phone number"
                    />
                  </div>
                  {phoneFormatIssue && (
                    <p className="text-xs text-amber-700">
                      Phone looks unusual. Include country code if applicable.
                    </p>
                  )}
                  {fieldErrors.phone && <p className="text-xs text-rose-600">{fieldErrors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">Company name</label>
                  <input
                    type="text"
                    value={formState.company_name}
                    onChange={onInputChange("company_name")}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-900 shadow-inner transition focus:border-emerald-200 focus:ring-2 focus:ring-emerald-100 ${
                      fieldErrors.company_name ? "border-rose-300" : "border-slate-200"
                    }`}
                    placeholder="Company or organization"
                  />
                  {fieldErrors.company_name && (
                    <p className="text-xs text-rose-600">{fieldErrors.company_name}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-1">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={profile.email || ""}
                      readOnly
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-10 py-2.5 text-sm text-slate-600 shadow-inner"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={!isDirty || saving}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reset changes
                </button>
                <div className="text-xs text-slate-500">
                  Editable: Full name, phone, company, avatar. Email and role are managed by the system.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default ProfilePage;
