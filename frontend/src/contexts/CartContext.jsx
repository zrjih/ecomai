import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const CartContext = createContext(null);

function getStorageKey(slug) {
  return `ecomai_cart_${slug || 'default'}`;
}

function loadCart(slug) {
  try {
    const raw = localStorage.getItem(getStorageKey(slug));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function CartProvider({ children }) {
  // Extract shopSlug from current URL since CartProvider wraps all storefront routes
  const slug = window.location.pathname.split('/store/')[1]?.split('/')[0] || '';
  const [items, setItems] = useState(() => loadCart(slug));

  // Persist to localStorage whenever items change
  useEffect(() => {
    if (slug) {
      localStorage.setItem(getStorageKey(slug), JSON.stringify(items));
    }
  }, [items, slug]);

  const addItem = useCallback((product, variant = null, quantity = 1) => {
    setItems((prev) => {
      const key = variant ? `${product.id}__${variant.id}` : product.id;
      const idx = prev.findIndex((i) => i.key === key);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity };
        return updated;
      }
      return [
        ...prev,
        {
          key,
          product_id: product.id,
          variant_id: variant?.id || null,
          name: product.name,
          variant_title: variant?.title || null,
          price: variant ? Number(variant.price) : Number(product.base_price),
          image: (product.images?.find(i => i.is_primary) || product.images?.[0])?.url || null,
          quantity,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((key) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const updateQuantity = useCallback((key, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.key !== key));
      return;
    }
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, quantity } : i)));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
