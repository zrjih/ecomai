import { useState, useEffect } from 'react';
import { websiteSettings } from '../api';
import { PageHeader, Card, Button, FormField, Input, Textarea } from '../components/UI';

export default function WebsiteSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const load = () => {
    setLoading(true);
    websiteSettings.get()
      .then((data) => {
        setSettings(data);
        setForm({
          theme_name: data.theme_name || 'default',
          design_tokens: JSON.stringify(data.design_tokens || {}, null, 2),
          layout_config: JSON.stringify(data.layout_config || {}, null, 2),
          navigation_config: JSON.stringify(data.navigation_config || {}, null, 2),
          homepage_config: JSON.stringify(data.homepage_config || {}, null, 2),
          custom_css: data.custom_css || '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true); setSuccess('');
    try {
      const patch = {
        theme_name: form.theme_name,
        design_tokens: JSON.parse(form.design_tokens),
        layout_config: JSON.parse(form.layout_config),
        navigation_config: JSON.parse(form.navigation_config),
        homepage_config: JSON.parse(form.homepage_config),
        custom_css: form.custom_css || null,
      };
      const updated = await websiteSettings.update(patch);
      setSettings(updated);
      setEditing(false);
      setSuccess('Website settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;

  const themes = [
    { name: 'default', label: 'Default', colors: ['#3b82f6', '#60a5fa', '#1e40af'] },
    { name: 'modern_luxe', label: 'Modern Luxe', colors: ['#121212', '#e3b341', '#333'] },
    { name: 'fresh_organic', label: 'Fresh Organic', colors: ['#22c55e', '#86efac', '#166534'] },
    { name: 'bold_pop', label: 'Bold Pop', colors: ['#ef4444', '#f59e0b', '#8b5cf6'] },
  ];

  return (
    <div>
      <PageHeader title="Website Settings" description="Configure your storefront theme and layout">
        {!editing && <Button onClick={() => setEditing(true)}>Edit Settings</Button>}
      </PageHeader>

      {success && <div className="mb-4 p-3 bg-success-50 text-success-600 text-sm rounded-lg">{success}</div>}

      {!editing ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="p-5">
              <h3 className="font-semibold mb-4">Theme</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700" />
                <div>
                  <p className="font-medium">{settings?.theme_name || 'default'}</p>
                  <p className="text-xs text-gray-500">Active theme</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-gray-500">Published Version</p>
                <p className="font-medium">{settings?.published_version}</p>
                <p className="text-gray-500">Draft Version</p>
                <p className="font-medium">{settings?.draft_version}</p>
                <p className="text-gray-500">Last Updated</p>
                <p>{settings?.updated_at ? new Date(settings.updated_at).toLocaleString() : '—'}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-5">
              <h3 className="font-semibold mb-4">Available Themes</h3>
              <div className="space-y-3">
                {themes.map((t) => (
                  <div key={t.name} className={`flex items-center gap-3 p-3 rounded-lg border ${
                    settings?.theme_name === t.name ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}>
                    <div className="flex gap-1">
                      {t.colors.map((c, i) => (
                        <div key={i} className="w-6 h-6 rounded-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.label}</p>
                      {settings?.theme_name === t.name && <p className="text-xs text-primary-600">Active</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <div className="p-5">
              <h3 className="font-semibold mb-4">Configuration Preview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Design Tokens</p>
                  <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-auto max-h-40">
                    {JSON.stringify(settings?.design_tokens || {}, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Layout Config</p>
                  <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-auto max-h-40">
                    {JSON.stringify(settings?.layout_config || {}, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Card>
          <div className="p-5">
            {error && <div className="mb-4 p-3 bg-danger-50 text-danger-600 text-sm rounded-lg">{error}</div>}
            <form onSubmit={handleSave}>
              <FormField label="Theme Name">
                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" value={form.theme_name} onChange={(e) => setForm({ ...form, theme_name: e.target.value })}>
                  {themes.map((t) => <option key={t.name} value={t.name}>{t.label}</option>)}
                </select>
              </FormField>
              <FormField label="Design Tokens (JSON)">
                <Textarea value={form.design_tokens} onChange={(e) => setForm({ ...form, design_tokens: e.target.value })} className="font-mono text-xs !h-28" />
              </FormField>
              <FormField label="Layout Config (JSON)">
                <Textarea value={form.layout_config} onChange={(e) => setForm({ ...form, layout_config: e.target.value })} className="font-mono text-xs !h-28" />
              </FormField>
              <FormField label="Navigation Config (JSON)">
                <Textarea value={form.navigation_config} onChange={(e) => setForm({ ...form, navigation_config: e.target.value })} className="font-mono text-xs !h-28" />
              </FormField>
              <FormField label="Homepage Config (JSON)">
                <Textarea value={form.homepage_config} onChange={(e) => setForm({ ...form, homepage_config: e.target.value })} className="font-mono text-xs !h-28" />
              </FormField>
              <FormField label="Custom CSS">
                <Textarea value={form.custom_css} onChange={(e) => setForm({ ...form, custom_css: e.target.value })} className="font-mono text-xs !h-28" placeholder=".my-class { color: red; }" />
              </FormField>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="secondary" type="button" onClick={() => setEditing(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</Button>
              </div>
            </form>
          </div>
        </Card>
      )}
    </div>
  );
}
