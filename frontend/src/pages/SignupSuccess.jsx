import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { setTokens } from '../api';
import { useAuth } from '../contexts/AuthContext';

/**
 * /signup/success
 * SSLCommerz redirects here after a successful subscription payment.
 * URL contains accessToken + refreshToken as query params.
 */
export default function SignupSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [countdown, setCountdown] = useState(5);
  const status = searchParams.get('status');
  const accessToken = searchParams.get('accessToken');
  const refreshToken = searchParams.get('refreshToken');

  useEffect(() => {
    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);

      // Decode user from JWT payload
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        setUser({ id: payload.id, role: payload.role, shop_id: payload.shop_id });
      } catch (_e) { /* ignore decode errors */ }

      // Auto-redirect to admin after countdown
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/admin');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [accessToken, refreshToken, setUser, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-teal-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Success icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-bounce">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">Payment Successful!</h1>
        <p className="text-gray-600 mb-2">
          Your subscription has been activated and your store is ready to go.
        </p>

        {accessToken ? (
          <div className="space-y-4 mt-6">
            <p className="text-sm text-gray-500">
              Redirecting to your dashboard in <span className="font-bold text-primary-600">{countdown}</span> seconds…
            </p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary-500 to-teal-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${((5 - countdown) / 5) * 100}%` }}
              />
            </div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              Go to Dashboard Now
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-gray-500">
              Your payment was processed successfully. Please log in to access your dashboard.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              Log In
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-8">
          A confirmation email will be sent to your registered email address.
        </p>
      </div>
    </div>
  );
}
