import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext';
import { storeApi } from '../../api-public';
import { resolveTokens } from '../templates';

export default function StoreResetPassword() {
  const { shopSlug, theme, tokens } = useStore();
  const t = resolveTokens(theme, tokens);
  const [searchParams] = useSearchParams();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const token = searchParams.get('token') || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setError(''); setLoading(true);
    try {
      await storeApi.resetPassword(shopSlug, token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Invalid or expired token. Please request a new reset link.');
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: t.text }}>Invalid Reset Link</h1>
        <p className="text-sm mb-6" style={{ color: t.textMuted }}>This password reset link is invalid or has expired.</p>
        <Link to={`/store/${shopSlug}/auth/forgot-password`}
          className="inline-flex items-center px-6 py-3 font-semibold text-sm transition hover:opacity-80"
          style={{ backgroundColor: t.primary, color: t.bg, borderRadius: t.buttonRadius }}>
          Request New Link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: t.text }}>Password Reset!</h1>
        <p className="text-sm mb-6" style={{ color: t.textMuted }}>Your password has been updated. You can now sign in.</p>
        <Link to={`/store/${shopSlug}/auth/login`}
          className="inline-flex items-center px-6 py-3 font-semibold text-sm transition hover:opacity-80"
          style={{ backgroundColor: t.primary, color: t.bg, borderRadius: t.buttonRadius }}>
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="p-6" style={{ backgroundColor: t.surface, borderRadius: t.radius, border: `1px solid ${t.border}` }}>
        <h1 className="text-2xl font-bold mb-2" style={{ color: t.text }}>Set New Password</h1>
        <p className="text-sm mb-6" style={{ color: t.textMuted }}>Enter your new password below.</p>

        {error && (
          <div className="mb-4 p-3 text-sm rounded-lg" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: t.text }}>New Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
              className="w-full px-4 py-2.5 text-sm outline-none transition"
              style={{ backgroundColor: t.bg, color: t.text, border: `1px solid ${t.border}`, borderRadius: t.radius }}
              placeholder="Min 6 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: t.text }}>Confirm Password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
              className="w-full px-4 py-2.5 text-sm outline-none transition"
              style={{ backgroundColor: t.bg, color: t.text, border: `1px solid ${t.border}`, borderRadius: t.radius }}
              placeholder="Repeat password" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 font-semibold text-sm transition hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: t.primary, color: t.bg, borderRadius: t.buttonRadius }}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
