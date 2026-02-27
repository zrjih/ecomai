import { useState, useEffect } from 'react';
import { shops } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader, Card } from '../components/UI';

export default function ShopSettings() {
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [allShops, setAllShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (user.role === 'super_admin') {
          const data = await shops.list();
          setAllShops(data.items);
        } else {
          const data = await shops.me();
          setShop(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;

  if (user.role === 'super_admin') {
    return (
      <div>
        <PageHeader title="All Shops" description="Platform-wide shop management (super admin)" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allShops.map((s) => (
            <Card key={s.id}>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-lg">🏪</div>
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.id}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-500">Slug</p>
                  <p className="font-mono text-xs">{s.slug || '—'}</p>
                  <p className="text-gray-500">Status</p>
                  <p className="capitalize">{s.status || 'active'}</p>
                  <p className="text-gray-500">Industry</p>
                  <p>{s.industry || '—'}</p>
                  <p className="text-gray-500">Plan</p>
                  <p className="capitalize">{s.subscription_plan || 'starter'}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!shop) return <p className="text-gray-500">Shop not found</p>;

  return (
    <div>
      <PageHeader title="Shop Settings" description="Your shop configuration" />
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-3xl">🏪</div>
            <div>
              <h2 className="text-xl font-bold">{shop.name}</h2>
              <p className="text-sm text-gray-500">{shop.id}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Slug</p>
              <p className="font-mono">{shop.slug || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <p className="capitalize font-medium">{shop.status || 'active'}</p>
            </div>
            <div>
              <p className="text-gray-500">Industry</p>
              <p>{shop.industry || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Subscription Plan</p>
              <p className="capitalize font-medium">{shop.subscription_plan || 'starter'}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
