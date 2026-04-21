import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../api';
import { Brand } from '../../types';

export default function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logo, setLogo] = useState('');

  const load = () => api.get<Brand[]>('/brands').then((r) => setBrands(r.data));
  useEffect(load, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/brands', { name, slug, logo: logo || undefined });
      setName(''); setSlug(''); setLogo('');
      load();
      toast.success('Добавлено');
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Ошибка');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Удалить бренд?')) return;
    try {
      await api.delete(`/brands/${id}`);
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Нельзя удалить: есть товары');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Бренды</h1>
      <form onSubmit={submit} className="card p-4 mb-4 grid md:grid-cols-[1fr_1fr_2fr_auto] gap-2">
        <input required className="input" placeholder="Название" value={name} onChange={(e) => setName(e.target.value)} />
        <input required className="input" placeholder="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <input className="input" placeholder="URL логотипа" value={logo} onChange={(e) => setLogo(e.target.value)} />
        <button className="btn-primary">Добавить</button>
      </form>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr><th className="p-2">Лого</th><th className="p-2">Название</th><th className="p-2">Slug</th><th className="p-2">Товаров</th><th></th></tr>
          </thead>
          <tbody>
            {brands.map((b) => (
              <tr key={b.id} className="border-t border-slate-100">
                <td className="p-2">{b.logo && <img src={b.logo} className="w-8 h-8 object-contain" />}</td>
                <td className="p-2">{b.name}</td>
                <td className="p-2 text-slate-500">{b.slug}</td>
                <td className="p-2">{b.count}</td>
                <td className="p-2"><button onClick={() => remove(b.id)} className="btn-ghost text-rose-600">×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
