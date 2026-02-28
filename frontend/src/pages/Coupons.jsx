import { useState, useEffect, useCallback } from 'react';
import { coupons as couponsApi } from '../api';
import { Card, Button, Badge } from '../components/UI';

const typeColors = { percentage: 'info', fixed: 'success' };

export default function Coupons() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', min_order_amount: '', max_discount: '', usage_limit: '', expires_at: '', is_active: true });

  const load = useCallback(() => {
    setLoading(true);
    couponsApi.list({ limit: 100 }).then(d => { setItems(d.items || []); setLoading(false); }).catch(e => { setError(e.message); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => { setForm({ code: '', type: 'percentage', value: '', min_order_amount: '', max_discount: '', usage_limit: '', expires_at: '', is_active: true }); setEditId(null); setShowForm(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const data = { ...form, value: Number(form.value), min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : undefined, max_discount: form.max_discount ? Number(form.max_discount) : undefined, usage_limit: form.usage_limit ? Number(form.usage_limit) : undefined };
    try {
      if (editId) await couponsApi.update(editId, data);
      else await couponsApi.create(data);
      resetForm();
      load();
    } catch (err) { setError(err.message); }
  };

  const startEdit = (c) => {
    setForm({ code: c.code, type: c.type, value: c.value, min_order_amount: c.min_order_amount || '', max_discount: c.max_discount || '', usage_limit: c.usage_limit || '', expires_at: c.expires_at ? c.expires_at.slice(0, 16) : '', is_active: c.is_active });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try { await couponsApi.delete(id); load(); } catch (err) { setError(err.message); }
  };

  if (loading) return <div className="p-6">Loading coupons...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Coupons & Discounts</h1>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>{showForm ? 'Cancel' : '+ New Coupon'}</Button>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded">{error}</div>}

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <div>
              <label className="block text-sm font-medium mb-1">Code</label>
              <input className="w-full border rounded px-3 py-2" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select className="w-full border rounded px-3 py-2" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Value</label>
              <input type="number" step="0.01" min="0" className="w-full border rounded px-3 py-2" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Min Order Amount</label>
              <input type="number" step="0.01" min="0" className="w-full border rounded px-3 py-2" value={form.min_order_amount} onChange={e => setForm(f => ({ ...f, min_order_amount: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Discount</label>
              <input type="number" step="0.01" min="0" className="w-full border rounded px-3 py-2" value={form.max_discount} onChange={e => setForm(f => ({ ...f, max_discount: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Usage Limit</label>
              <input type="number" min="0" className="w-full border rounded px-3 py-2" value={form.usage_limit} onChange={e => setForm(f => ({ ...f, usage_limit: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expires At</label>
              <input type="datetime-local" className="w-full border rounded px-3 py-2" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} id="coupon-active" />
              <label htmlFor="coupon-active">Active</label>
            </div>
            <div className="col-span-full">
              <Button type="submit">{editId ? 'Update Coupon' : 'Create Coupon'}</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Code</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Value</th>
                <th className="text-left p-3">Min Order</th>
                <th className="text-left p-3">Usage</th>
                <th className="text-left p-3">Expires</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(c => (
                <tr key={c.id} className="border-t">
                  <td className="p-3 font-mono font-bold">{c.code}</td>
                  <td className="p-3"><Badge variant={typeColors[c.type]}>{c.type}</Badge></td>
                  <td className="p-3">{c.type === 'percentage' ? `${c.value}%` : `৳${c.value}`}</td>
                  <td className="p-3">{c.min_order_amount ? `৳${c.min_order_amount}` : '—'}</td>
                  <td className="p-3">{c.usage_count}{c.usage_limit ? `/${c.usage_limit}` : ''}</td>
                  <td className="p-3">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : '—'}</td>
                  <td className="p-3"><Badge variant={c.is_active ? 'success' : 'danger'}>{c.is_active ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => startEdit(c)} className="text-blue-600 hover:underline text-sm">Edit</button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={8} className="p-6 text-center text-gray-500">No coupons yet. Create your first one!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
