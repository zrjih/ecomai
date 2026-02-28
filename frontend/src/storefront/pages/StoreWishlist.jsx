import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext';
import { useCart } from '../../contexts/CartContext';
import { storeApi } from '../../api-public';
import { resolveTokens } from '../templates';
import { HeartIcon } from '../icons';

export default function StoreWishlist() {
  const { shopSlug, theme, tokens, formatPrice } = useStore();
  const { addItem } = useCart();
  const t = resolveTokens(theme, tokens);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await storeApi.getWishlist(shopSlug);
        setItems(data.items || []);
      } catch (err) {
        if (err.message?.includes('401') || err.message?.includes('auth')) {
          setError('login');
        } else {
          setError(err.message);
        }
      }
      setLoading(false);
    };
    load();
  }, [shopSlug]);

  const handleRemove = async (productId) => {
    try {
      await storeApi.removeFromWishlist(shopSlug, productId);
      setItems(prev => prev.filter(item => item.product_id !== productId));
    } catch {}
  };

  const handleAddToCart = (item) => {
    addItem({
      id: item.product_id,
      name: item.product_name || item.name,
      price: item.base_price || item.price,
      image_url: item.image_url,
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: t.primary }} />
      </div>
    );
  }

  if (error === 'login') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: t.text }}>Sign in to view your wishlist</h1>
        <p className="text-sm mb-6" style={{ color: t.textMuted }}>You need an account to save and view your favorite products.</p>
        <Link to={`/store/${shopSlug}/auth/login`}
          className="inline-flex items-center px-6 py-3 font-semibold text-sm transition hover:opacity-80"
          style={{ backgroundColor: t.primary, color: t.bg, borderRadius: t.buttonRadius }}>
          Sign In
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-5xl mb-4"><HeartIcon filled={false} className="w-16 h-16 mx-auto" style={{ color: t.textMuted }} /></div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: t.text }}>Your wishlist is empty</h1>
        <p className="text-sm mb-6" style={{ color: t.textMuted }}>Browse products and tap the heart icon to save your favorites.</p>
        <Link to={`/store/${shopSlug}/products`}
          className="inline-flex items-center px-6 py-3 font-semibold text-sm transition hover:opacity-80"
          style={{ backgroundColor: t.primary, color: t.bg, borderRadius: t.buttonRadius }}>
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-2" style={{ color: t.text }}>My Wishlist</h1>
      <p className="text-sm mb-8" style={{ color: t.textMuted }}>{items.length} saved item{items.length !== 1 ? 's' : ''}</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(item => (
          <div key={item.product_id} className="group relative overflow-hidden transition-all hover:shadow-lg"
            style={{ backgroundColor: t.surface, borderRadius: t.radius, border: `1px solid ${t.border}`, boxShadow: t.cardShadow }}>
            <Link to={`/store/${shopSlug}/products/${item.product_id}`}>
              <div className="aspect-square overflow-hidden" style={{ backgroundColor: t.border }}>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.product_name || item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl" style={{ color: t.textMuted }}>📦</div>
                )}
              </div>
            </Link>

            {/* Remove button */}
            <button onClick={() => handleRemove(item.product_id)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-70 hover:opacity-100"
              style={{ backgroundColor: t.bg, boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
              <HeartIcon filled={true} className="w-4 h-4" style={{ color: '#ef4444' }} />
            </button>

            <div className="p-3">
              <Link to={`/store/${shopSlug}/products/${item.product_id}`}>
                <h3 className="font-medium text-sm line-clamp-2 mb-1 hover:opacity-70 transition" style={{ color: t.text }}>{item.product_name || item.name}</h3>
              </Link>
              <p className="font-bold text-base mb-3" style={{ color: t.primary }}>{formatPrice(item.base_price || item.price)}</p>
              <button onClick={() => handleAddToCart(item)}
                className="w-full py-2 text-xs font-semibold transition hover:opacity-80"
                style={{ backgroundColor: t.primary, color: t.bg, borderRadius: t.buttonRadius }}>
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
