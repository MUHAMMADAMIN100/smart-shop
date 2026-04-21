import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../api';
import { PaginatedProducts, Product } from '../../types';
import { formatPrice } from '../../utils/format';

export default function AdminProducts() {
  const [data, setData] = useState<PaginatedProducts | null>(null);

  const load = () => api.get<PaginatedProducts>('/products', { params: { pageSize: 60 } }).then((r) => setData(r.data));
  useEffect(() => { load(); }, []);

  const remove = async (p: Product) => {
    if (!confirm(`Удалить ${p.title}?`)) return;
    try {
      await api.delete(`/products/${p.id}`);
      toast.success('Удалено');
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Ошибка');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Товары</h1>
        <Link to="/admin/products/new" className="btn-primary">+ Создать</Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-left">
            <tr>
              <th className="p-2">Товар</th>
              <th className="p-2">Бренд</th>
              <th className="p-2">Цена</th>
              <th className="p-2">Варианты</th>
              <th className="p-2">Активен</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="p-2 flex items-center gap-2">
                  {p.images[0] && <img src={p.images[0].url} className="w-10 h-10 object-cover rounded" />}
                  <div>
                    <div className="font-medium">{p.title}</div>
                    <div className="text-xs text-slate-400">{p.slug}</div>
                  </div>
                </td>
                <td className="p-2">{p.brand.name}</td>
                <td className="p-2">{formatPrice(p.basePrice)}</td>
                <td className="p-2">{p.variants.length}</td>
                <td className="p-2">{p.isActive !== false ? '✓' : '×'}</td>
                <td className="p-2 whitespace-nowrap">
                  <Link to={`/admin/products/${p.id}/edit`} className="btn-ghost">Изменить</Link>
                  <button onClick={() => remove(p)} className="btn-ghost text-rose-600">Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
