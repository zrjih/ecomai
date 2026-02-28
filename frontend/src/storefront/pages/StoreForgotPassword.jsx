import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext';
import { storeApi } from '../../api-public';
import { resolveTokens } from '../templates';

export default function StoreForgotPassword() {
  const { shopSlug, theme, tokens } = useStore();
  const t = resolveTokens(theme, tokens);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await storeApi.forgotPassword(shopSlug, email);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">📧</div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: t.text }}>Check your email</h1>
        <p className="text-sm mb-6" style={{ color: t.textMuted }}>
          If an account exists for <strong>{email}</strong>, we've sent password reset instructions.
        </p>
        <Link to={`/store/${shopSlug}/auth/login`}
          className="text-sm font-medium transition hover:opacity-70" style={{ color: t.primary }}>
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="p-6" style={{ backgroundColor: t.surface, borderRadius: t.radius, border: `1px solid ${t.border}` }}>
        <h1 className="text-2xl font-bold mb-2" style={{ color: t.text }}>Forgot Password</h1>
        <p className="text-sm mb-6" style={{ color: t.textMuted }}>Enter your email and we'll send you a reset link.</p>

        {error && (
          <div className="mb-4 p-3 text-sm rounded-lg" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: t.text }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-4 py-2.5 text-sm outline-none transition"
              style={{ backgroundColor: t.bg, color: t.text, border: `1px solid ${t.border}`, borderRadius: t.radius }}
              placeholder="you@example.com" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 font-semibold text-sm transition hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: t.primary, color: t.bg, borderRadius: t.buttonRadius }}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-center text-sm mt-4" style={{ color: t.textMuted }}>
          Remember your password?{' '}
          <Link to={`/store/${shopSlug}/auth/login`} className="font-medium transition hover:opacity-70" style={{ color: t.primary }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
