import { Link, useParams } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext';
import { resolveTokens } from '../templates';

export default function CheckoutCancel() {
  const { shopSlug } = useParams();
  const { theme, tokens } = useStore();
  const t = resolveTokens(theme, tokens);

  return (
    <div className="max-w-lg mx-auto py-20 px-4 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${t.primary}10` }}>
        <svg className="w-10 h-10" style={{ color: t.textMuted }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold mb-4" style={{ color: t.text }}>Payment Cancelled</h1>
      <p className="mb-8" style={{ color: t.textMuted }}>You cancelled the payment. Your cart is still saved.</p>
      <div className="flex items-center justify-center gap-4">
        <Link to={`/store/${shopSlug}/cart`} className="px-6 py-2.5 font-medium transition hover:opacity-80" style={{ backgroundColor: t.primary, color: t.bg, borderRadius: t.buttonRadius }}>
          Back to Cart
        </Link>
        <Link to={`/store/${shopSlug}`} className="px-6 py-2.5 font-medium transition hover:opacity-80" style={{ border: `1px solid ${t.border}`, color: t.text, borderRadius: t.buttonRadius }}>
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
