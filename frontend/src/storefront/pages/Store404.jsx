import { Link } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext';
import { resolveTokens } from '../templates';

export default function Store404() {
  const { shopSlug, theme, tokens, shop } = useStore();
  const t = resolveTokens(theme, tokens);

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="text-8xl font-bold mb-4" style={{ color: t.border }}>404</div>
      <h1 className="text-3xl font-bold mb-3" style={{ color: t.text }}>Page Not Found</h1>
      <p className="text-base mb-8" style={{ color: t.textMuted }}>
        The page you're looking for doesn't exist or has been moved.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link to={`/store/${shopSlug}`}
          className="inline-flex items-center px-6 py-3 font-semibold text-sm transition hover:opacity-80"
          style={{ backgroundColor: t.primary, color: t.bg, borderRadius: t.buttonRadius }}>
          Go Home
        </Link>
        <Link to={`/store/${shopSlug}/products`}
          className="inline-flex items-center px-6 py-3 font-semibold text-sm transition hover:opacity-80"
          style={{ backgroundColor: 'transparent', color: t.primary, borderRadius: t.buttonRadius, border: `2px solid ${t.primary}` }}>
          Browse Products
        </Link>
      </div>

      {/* Fun illustration */}
      <div className="mt-12 mx-auto max-w-xs">
        <svg viewBox="0 0 200 150" fill="none" className="w-full opacity-40">
          <rect x="40" y="20" width="120" height="90" rx="8" stroke={t.textMuted} strokeWidth="2" strokeDasharray="6 4" />
          <circle cx="80" cy="60" r="8" fill={t.border} />
          <circle cx="120" cy="60" r="8" fill={t.border} />
          <path d="M75 85 c10 -10 40 -10 50 0" stroke={t.textMuted} strokeWidth="2" strokeLinecap="round" />
          <line x1="60" y1="130" x2="140" y2="130" stroke={t.border} strokeWidth="2" />
          <line x1="70" y1="140" x2="130" y2="140" stroke={t.border} strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}
