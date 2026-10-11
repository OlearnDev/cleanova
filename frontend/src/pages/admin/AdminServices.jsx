import { useEffect, useState } from 'react';
import api, { apiErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { mediaUrl, formatCurrency } from '../../utils/media';
import { getServiceIllustration } from '../../utils/serviceImages';

const emptyForm = { name: '', description: '', price: '', durationMinutes: 60, categoryId: '', isActive: true };

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  function reload() {
    setLoading(true);
    Promise.all([
      api.get('/services', { params: { includeInactive: true } }),
      api.get('/services/categories'),
    ]).then(([servicesRes, catRes]) => {
      setServices(servicesRes.data.services);
      setCategories(catRes.data.categories);
    }).finally(() => setLoading(false));
  }

  useEffect(reload, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setImage(null);
    setModalOpen(true);
  }

  function openEdit(service) {
    setEditing(service);
    setForm({
      name: service.name, description: service.description || '', price: service.price,
      durationMinutes: service.duration_minutes, categoryId: service.category_id || '', isActive: service.is_active,
    });
    setImage(null);
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);

      if (editing) {
        await api.put(`/services/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Service mis a jour.');
      } else {
        await api.post('/services', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Service cree.');
      }
      setModalOpen(false);
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Supprimer ce service ?')) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success('Service supprime.');
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Suppression impossible (peut-etre lie a des reservations).'));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900 lg:hidden">Gestion des services</h1>
        <button onClick={openCreate} className="ml-auto bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold px-4 py-2 rounded-lg">
          + Nouveau service
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s) => (
            <div key={s.id} className={`bg-white rounded-2xl border shadow-soft overflow-hidden ${!s.is_active ? 'opacity-60' : 'border-gray-100'}`}>
              <div className="h-32 bg-brand-50 flex items-center justify-center">
                <img src={s.image_url ? mediaUrl(s.image_url) : getServiceIllustration(s)} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="p-4 space-y-1">
                <p className="font-semibold text-gray-900">{s.name}</p>
                <p className="text-xs text-gray-400">{s.category_name || 'Sans categorie'}</p>
                <p className="text-brand-700 font-bold">{formatCurrency(s.price)}</p>
                {!s.is_active && <span className="text-xs text-red-500 font-semibold">Inactif</span>}
                <div className="flex gap-2 pt-2">
                  <button onClick={() => openEdit(s)} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">Modifier</button>
                  <button onClick={() => handleDelete(s.id)} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">Supprimer</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Modifier le service' : 'Nouveau service'}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600">Annuler</button>
            <button onClick={handleSubmit} disabled={saving} className="px-4 py-2 text-sm font-semibold bg-brand-700 text-white rounded-lg disabled:opacity-60">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField label="Nom" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Prix ($)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} required />
            <TextField label="Duree (min)" type="number" value={form.durationMinutes} onChange={(v) => setForm({ ...form, durationMinutes: v })} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Categorie</label>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2">
              <option value="">Sans categorie</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="mt-1 w-full text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Service actif (visible publiquement)
          </label>
        </form>
      </Modal>
    </div>
  );
}

function TextField({ label, type = 'text', value, onChange, required }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2" />
    </div>
  );
}
