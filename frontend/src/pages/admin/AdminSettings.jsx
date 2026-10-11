import { useEffect, useState } from 'react';
import api, { apiErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [zones, setZones] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newZone, setNewZone] = useState('');
  const [newSlot, setNewSlot] = useState({ label: '', startTime: '', endTime: '' });
  const toast = useToast();

  function reload() {
    setLoading(true);
    api.get('/admin/settings').then(({ data }) => {
      setSettings(data.settings);
      setZones(data.zones);
      setTimeSlots(data.timeSlots);
    }).finally(() => setLoading(false));
  }
  useEffect(reload, []);

  async function saveSettings(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/settings', settings);
      toast.success('Parametres enregistres.');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function addZone() {
    if (!newZone.trim()) return;
    try {
      await api.post('/admin/zones', { name: newZone.trim() });
      setNewZone('');
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function deleteZone(id) {
    await api.delete(`/admin/zones/${id}`);
    reload();
  }

  async function addTimeSlot() {
    if (!newSlot.label || !newSlot.startTime || !newSlot.endTime) return;
    try {
      await api.post('/admin/time-slots', newSlot);
      setNewSlot({ label: '', startTime: '', endTime: '' });
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function deleteTimeSlot(id) {
    await api.delete(`/admin/time-slots/${id}`);
    reload();
  }

  if (loading) return <LoadingSpinner full />;

  return (
    <div className="space-y-8 max-w-3xl">
      <form onSubmit={saveSettings} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Informations de l'entreprise</h2>
        <SettingField label="Nom de l'entreprise" value={settings.company_name} onChange={(v) => setSettings({ ...settings, company_name: v })} />
        <SettingField label="Email de contact" value={settings.company_email} onChange={(v) => setSettings({ ...settings, company_email: v })} />
        <SettingField label="Telephone" value={settings.company_phone} onChange={(v) => setSettings({ ...settings, company_phone: v })} />
        <SettingField label="Prix par defaut d'une visite ($)" type="number" value={settings.default_visit_price} onChange={(v) => setSettings({ ...settings, default_visit_price: v })} />
        <button type="submit" disabled={saving} className="bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-semibold py-2 px-6 rounded-lg">
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Zones d'intervention</h2>
        <div className="flex flex-wrap gap-2">
          {zones.map((z) => (
            <span key={z.id} className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-sm font-medium px-3 py-1.5 rounded-full">
              {z.name}
              <button onClick={() => deleteZone(z.id)} className="text-brand-400 hover:text-red-500">&times;</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newZone} onChange={(e) => setNewZone(e.target.value)} placeholder="Nouvelle zone (ex: Abidjan - Yopougon)" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <button onClick={addZone} className="bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold px-4 py-2 rounded-lg">Ajouter</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Plages horaires</h2>
        <div className="space-y-2">
          {timeSlots.map((t) => (
            <div key={t.id} className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2 text-sm">
              <span>{t.label}: {t.start_time?.slice(0, 5)} - {t.end_time?.slice(0, 5)}</span>
              <button onClick={() => deleteTimeSlot(t.id)} className="text-red-500 text-xs font-semibold">Supprimer</button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input value={newSlot.label} onChange={(e) => setNewSlot({ ...newSlot, label: e.target.value })} placeholder="Libelle" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <input type="time" value={newSlot.startTime} onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <input type="time" value={newSlot.endTime} onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <button onClick={addTimeSlot} className="bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold px-4 py-2 rounded-lg">Ajouter</button>
        </div>
      </div>
    </div>
  );
}

function SettingField({ label, type = 'text', value, onChange }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5" />
    </div>
  );
}
