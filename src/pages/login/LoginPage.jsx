import React, { useState } from 'react';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { colors } from '../../components/landing/colors';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth, { getRedirectPathForRole } from '../../hooks/useAuth';

const fieldBase =
  'w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:border-black focus:ring-2 focus:ring-black/10 transition bg-white';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    setLoading(true);
    try {
      const params = new URLSearchParams(location.search);
      const from = params.get('from');
      const authData = await login({ email, password });
      const role = authData?.user?.role;
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate(getRedirectPathForRole(role));
      }
    } catch (err) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-gray-50 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-20 -top-24 w-80 h-80 rounded-full blur-3xl opacity-60" style={{ backgroundColor: '#FFF4C9' }} />
        <div className="absolute right-[-60px] top-10 w-96 h-96 rounded-full blur-3xl opacity-50" style={{ backgroundColor: '#FFE08A' }} />
        <div className="absolute bottom-[-140px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full border border-yellow-200 opacity-50" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 flex flex-col items-center">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl shadow-md bg-white border border-gray-100 mb-4">
            <span className="text-2xl font-extrabold" style={{ color: colors.primaryBlack }}>
              C
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: colors.primaryBlack }}>
            Welcome back to CABIN Logistics Platform
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl">
            Securely access your unified workspace for Sellers, Buyers, and Service Providers.
          </p>
        </div>

        <div className="w-full grid lg:grid-cols-[1fr_auto] gap-10 items-center justify-items-center">
          <div className="w-full max-w-xl">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm font-semibold text-gray-500 tracking-wide uppercase">Sign in</p>
                  <h2 className="text-2xl font-bold mt-1" style={{ color: colors.primaryBlack }}>
                    Access your account
                  </h2>
                </div>
                <div
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ backgroundColor: '#FFF4C9', color: colors.primaryBlack }}
                >
                  Secure
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="email">
                    Email address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={fieldBase}
                      placeholder="you@company.com"
                      style={{ color: colors.primaryBlack }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={fieldBase}
                      placeholder="Enter your password"
                      style={{ color: colors.primaryBlack }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="font-semibold text-gray-700 hover:text-black"
                  >
                    Forgot your password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-full font-bold shadow-lg transition transform hover:-translate-y-0.5 hover:shadow-xl"
                  style={{ backgroundColor: colors.primaryYellow, color: colors.primaryBlack }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                  <FiArrowRight />
                </button>

                <p className="text-sm text-center text-gray-600">
                  Don’t have an account?{' '}
                  <a href="#" className="font-bold text-gray-900 hover:underline">
                    Create one
                  </a>
                </p>
              </form>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center gap-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mobile preview</div>
            <div className="w-64 bg-white rounded-[28px] shadow-2xl border border-gray-100 p-6 space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gray-100 text-sm font-extrabold" style={{ color: colors.primaryBlack }}>
                  C
                </div>
                <p className="text-base font-bold mt-3" style={{ color: colors.primaryBlack }}>
                  CABIN Login
                </p>
              </div>
              <div className="space-y-3">
                <div className="h-10 rounded-xl bg-gray-100 border border-gray-200" />
                <div className="h-10 rounded-xl bg-gray-100 border border-gray-200" />
                <div
                  className="h-11 rounded-full flex items-center justify-center font-bold"
                  style={{ backgroundColor: colors.primaryYellow, color: colors.primaryBlack }}
                >
                  Sign In
                </div>
              </div>
              <p className="text-[11px] text-center text-gray-500">
                Adaptive layout ensures fast, focused sign-in on smaller screens.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
