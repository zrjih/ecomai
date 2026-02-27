import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { products, orders, customers, campaigns } from '../api';
import { StatCard, Card } from '../components/UI';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ products: 0, orders: 0, customers: 0, campaigns: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    Promise.allSettled([
      products.list(),
      orders.list(),
      customers.list(),
      campaigns.list(),
    ]).then(([p, o, c, m]) => {
      setStats({
        products: p.status === 'fulfilled' ? p.value.count : 0,
        orders: o.status === 'fulfilled' ? o.value.count : 0,
        customers: c.status === 'fulfilled' ? c.value.count : 0,
        campaigns: m.status === 'fulfilled' ? m.value.count : 0,
      });
      if (o.status === 'fulfilled') {
        setRecentOrders(o.value.items.slice(-5).reverse());
      }
    });
  }, []);

  const revenue = recentOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1">
          Signed in as <span className="font-medium">{user?.email}</span> ({user?.role?.replace('_', ' ')})
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Products" value={stats.products} icon="📦" color="primary" />
        <StatCard label="Orders" value={stats.orders} icon="🛒" color="success" />
        <StatCard label="Customers" value={stats.customers} icon="👥" color="warning" />
        <StatCard label="Campaigns" value={stats.campaigns} icon="📣" color="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-5">
            <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray-500">No orders yet. Create products and place orders to see them here.</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{order.id}</p>
                      <p className="text-xs text-gray-500">{order.customer_email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">${Number(order.total_amount).toFixed(2)}</p>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-5">
            <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Revenue</span>
                <span className="text-lg font-bold text-success-600">${revenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Avg Order Value</span>
                <span className="text-lg font-bold">
                  ${recentOrders.length > 0 ? (revenue / recentOrders.length).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Active Campaigns</span>
                <span className="text-lg font-bold text-primary-600">{stats.campaigns}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
