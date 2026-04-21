import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../api';
import { Role } from '../../types';
import { formatDate } from '../../utils/format';

interface U {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: Role;
  createdAt: string;
  _count: { orders: number };
}

export default function AdminUsers() {
  const [users, setUsers] = useState<U[]>([]);
  const [search, setSearch] = useState('');

  const load = () => api.get<U[]>('/admin/users', { params: search ? { search } : {} }).then((r) => setUsers(r.data));
  useEffect(load, [search]);

  const toggleRole = async (u: U) => {
    const next: Role = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`Сделать ${u.email} ${next === 'ADMIN' ? 'администратором' : 'обычным пользователем'}?`)) return;
    await api.patch(`/admin/users/${u.id}/role`, { role: next });
    toast.success('Роль обновлена');
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Пользователи</h1>
      <input className="input max-w-xs mb-4" placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="p-2">Email</th>
              <th className="p-2">Имя</th>
              <th className="p-2">Телефон</th>
              <th className="p-2">Заказов</th>
              <th className="p-2">Роль</th>
              <th className="p-2">Создан</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.name ?? '—'}</td>
                <td className="p-2">{u.phone ?? '—'}</td>
                <td className="p-2">{u._count.orders}</td>
                <td className="p-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${u.role === 'ADMIN' ? 'bg-brand-100 text-brand-700' : 'bg-slate-100'}`}>{u.role}</span>
                </td>
                <td className="p-2 text-slate-600">{formatDate(u.createdAt)}</td>
                <td className="p-2">
                  <button onClick={() => toggleRole(u)} className="btn-ghost text-xs">
                    {u.role === 'ADMIN' ? '→ USER' : '→ ADMIN'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
