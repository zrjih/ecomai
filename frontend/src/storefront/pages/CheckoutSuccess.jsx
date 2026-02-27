import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { useCart } from '../../contexts/CartContext';
import { resolveTokens } from '../templates';

export default function CheckoutSuccess() {
  const { shopSlug } = useParams();
  const [searchParams] = useSearchParams();
  const tranId = searchParams.get('tran_id');
  const { theme, tokens } = useStore();
  const { clearCart } = useCart();
  const t = resolveTokens(theme, tokens);

  // Clear cart on successful payment
  useEffect(() => { clearCart(); }, [clearCart]);

  return (
    <div className="max-w-lg mx-auto py-20 px-4 text-center" style={{ color: t.text }}>
      <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${t.primary}15` }}>
        <svg className="w-10 h-10" style={{ color: t.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold mb-4" style={{ color: t.text }}>Payment Successful!</h1>
      <p className="mb-2" style={{ color: t.textMuted }}>Your order has been confirmed and is being processed.</p>
      {tranId && <p className="text-sm mb-8" style={{ color: t.textMuted }}>Transaction ID: {tranId}</p>}
      <div className="flex items-center justify-center gap-4">
        <Link to={`/store/${shopSlug}/account`} className="px-6 py-2.5 font-medium transition hover:opacity-80" style={{ backgroundColor: t.primary, color: t.bg, borderRadius: t.buttonRadius }}>
          View My Orders
        </Link>
        <Link to={`/store/${shopSlug}/products`} className="px-6 py-2.5 font-medium transition hover:opacity-80" style={{ border: `1px solid ${t.border}`, color: t.text, borderRadius: t.buttonRadius }}>
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
