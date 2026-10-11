import { useEffect, useState } from 'react';
import api, { apiErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { mediaUrl } from '../../utils/media';
import { getPartnerLogo } from '../../utils/partnerImages';

const emptyForm = { name: '', websiteUrl: '', category: '', description: '', isActive: true };

export default function AdminPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [logo, setLogo] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  function reload() {
    setLoading(true);
    api.get('/partners').then(({ data }) => setPartners(data.partners)).finally(() => setLoading(false));
  }
  useEffect(reload, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setLogo(null);
    setModalOpen(true);
  }

  function openEdit(p) {
    setEditing(p);
    setForm({ name: p.name, websiteUrl: p.website_url || '', category: p.category || '', description: p.description || '', isActive: p.is_active });
    setLogo(null);
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (logo) fd.append('logo', logo);

      if (editing) {
        await api.put(`/partners/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Partenaire mis a jour.');
      } else {
        await api.post('/partners', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Partenaire ajoute.');
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
    if (!window.confirm('Supprimer ce partenaire ?')) return;
    try {
      await api.delete(`/partners/${id}`);
      toast.success('Partenaire supprime.');
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900 lg:hidden">Partenaires</h1>
        <button onClick={openCreate} className="ml-auto bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold px-4 py-2 rounded-lg">
          + Nouveau partenaire
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {partners.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5 flex flex-col gap-3">
              <div className="h-16 flex items-center">
                {(p.logo_url ? mediaUrl(p.logo_url) : getPartnerLogo(p)) ? (
                  <img src={p.logo_url ? mediaUrl(p.logo_url) : getPartnerLogo(p)} alt="" className="max-h-16 object-contain" />
                ) : (
                  <span className="text-lg font-bold text-brand-700">{p.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <p className="font-semibold text-gray-900">{p.name}</p>
              <p className="text-xs text-gray-400">{p.category}</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(p)} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">Modifier</button>
                <button onClick={() => handleDelete(p.id)} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? 'Modifier le partenaire' : 'Nouveau partenaire'}
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
          <TextField label="Site web" value={form.websiteUrl} onChange={(v) => setForm({ ...form, websiteUrl: v })} />
          <TextField label="Categorie" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Logo</label>
            <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] || null)} className="mt-1 w-full text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Partenaire actif (visible publiquement)
          </label>
        </form>
      </Modal>
    </div>
  );
}

function TextField({ label, value, onChange, required }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input value={value} required={required} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2" />
    </div>
  );
}
