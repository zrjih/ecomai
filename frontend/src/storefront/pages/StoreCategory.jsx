import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext';
import { useCart } from '../../contexts/CartContext';
import { storeApi } from '../../api-public';
import { resolveTokens } from '../templates';

export default function StoreCategory() {
  const { shopSlug, theme, tokens, formatPrice } = useStore();
  const { categoryId } = useParams();
  const { addItem } = useCart();
  const t = resolveTokens(theme, tokens);

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          storeApi.getCategories(shopSlug),
          storeApi.getProducts(shopSlug),
        ]);
        const catList = cats.items || cats || [];
        setCategories(catList);
        if (categoryId) {
          const cat = catList.find(c => c.id === categoryId);
          setCategory(cat || null);
          const allProducts = prods.items || prods || [];
          setProducts(allProducts.filter(p => p.category_id === categoryId));
        } else {
          setProducts([]);
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, [shopSlug, categoryId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: t.primary }} />
      </div>
    );
  }

  // No categoryId => show all categories
  if (!categoryId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold mb-2" style={{ color: t.text }}>Categories</h1>
        <p className="text-sm mb-8" style={{ color: t.textMuted }}>Browse our product categories</p>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📂</div>
            <p className="text-lg" style={{ color: t.textMuted }}>No categories yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map(cat => (
              <Link key={cat.id} to={`/store/${shopSlug}/categories/${cat.id}`}
                className="group overflow-hidden transition-all hover:shadow-lg"
                style={{ backgroundColor: t.surface, borderRadius: t.radius, border: `1px solid ${t.border}` }}>
                {cat.image_url ? (
                  <div className="aspect-video overflow-hidden" style={{ backgroundColor: t.border }}>
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${t.primary}22, ${t.secondary}22)` }}>
                    <span className="text-4xl">📦</span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold" style={{ color: t.text }}>{cat.name}</h3>
                  {cat.description && <p className="text-xs mt-1 line-clamp-2" style={{ color: t.textMuted }}>{cat.description}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Show products in this category
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm mb-4" style={{ color: t.textMuted }}>
        <Link to={`/store/${shopSlug}`} className="hover:opacity-70 transition">Home</Link>
        <span className="mx-2">/</span>
        <Link to={`/store/${shopSlug}/categories`} className="hover:opacity-70 transition">Categories</Link>
        <span className="mx-2">/</span>
        <span style={{ color: t.text }}>{category?.name || 'Category'}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2" style={{ color: t.text }}>{category?.name || 'Category'}</h1>
      {category?.description && <p className="text-sm mb-6" style={{ color: t.textMuted }}>{category.description}</p>}

      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-lg mb-4" style={{ color: t.textMuted }}>No products in this category yet</p>
          <Link to={`/store/${shopSlug}/products`} className="text-sm font-medium hover:opacity-70 transition" style={{ color: t.primary }}>
            View all products
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm mb-6" style={{ color: t.textMuted }}>{products.length} product{products.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <div key={product.id} className="group overflow-hidden transition-all hover:shadow-lg"
                style={{ backgroundColor: t.surface, borderRadius: t.radius, border: `1px solid ${t.border}`, boxShadow: t.cardShadow }}>
                <Link to={`/store/${shopSlug}/products/${product.id}`}>
                  <div className="aspect-square overflow-hidden" style={{ backgroundColor: t.border }}>
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl" style={{ color: t.textMuted }}>📦</div>
                    )}
                  </div>
                </Link>
                <div className="p-3">
                  <Link to={`/store/${shopSlug}/products/${product.id}`}>
                    <h3 className="font-medium text-sm line-clamp-2 mb-1 hover:opacity-70 transition" style={{ color: t.text }}>{product.name}</h3>
                  </Link>
                  {product.compare_at_price && Number(product.compare_at_price) > Number(product.base_price) && (
                    <span className="text-xs line-through mr-2" style={{ color: t.textMuted }}>{formatPrice(product.compare_at_price)}</span>
                  )}
                  <span className="font-bold" style={{ color: t.primary }}>{formatPrice(product.base_price)}</span>
                  <button onClick={() => addItem({ id: product.id, name: product.name, price: product.base_price, image_url: product.image_url })}
                    className="w-full mt-3 py-2 text-xs font-semibold transition hover:opacity-80"
                    style={{ backgroundColor: t.primary, color: t.bg, borderRadius: t.buttonRadius }}>
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
