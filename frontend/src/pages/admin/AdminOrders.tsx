import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../api';
import { Order, OrderStatus } from '../../types';
import { formatDate, formatPrice, orderStatusColor, orderStatusLabel } from '../../utils/format';

const STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [search, setSearch] = useState('');

  const load = () => {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    if (search) params.search = search;
    api.get<Order[]>('/orders/admin', { params }).then((r) => setOrders(r.data));
  };
  useEffect(load, [status, search]);

  const setOrderStatus = async (id: string, s: OrderStatus) => {
    try {
      await api.patch(`/orders/${id}/status`, { status: s });
      toast.success('Статус обновлён');
      load();
    } catch {
      toast.error('Ошибка');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Заказы</h1>

      <div className="flex gap-2 mb-4">
        <input className="input max-w-xs" placeholder="№ заказа, ФИО, телефон" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input max-w-[200px]" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | '')}>
          <option value="">Все статусы</option>
          {STATUSES.map((s) => <option key={s} value={s}>{orderStatusLabel[s]}</option>)}
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="p-2">№</th>
              <th className="p-2">Клиент</th>
              <th className="p-2">Дата</th>
              <th className="p-2">Товары</th>
              <th className="p-2">Сумма</th>
              <th className="p-2">Статус</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-slate-100">
                <td className="p-2 font-mono text-xs">{o.orderNumber}</td>
                <td className="p-2">
                  <div>{o.user?.name ?? o.shipFullName}</div>
                  <div className="text-xs text-slate-500">{o.user?.email}</div>
                </td>
                <td className="p-2 text-slate-600">{formatDate(o.createdAt)}</td>
                <td className="p-2">{o.items.length}</td>
                <td className="p-2 font-medium">{formatPrice(o.total)}</td>
                <td className="p-2">
                  <select
                    className={`text-xs px-2 py-1 rounded border-0 ${orderStatusColor[o.status]}`}
                    value={o.status}
                    onChange={(e) => setOrderStatus(o.id, e.target.value as OrderStatus)}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{orderStatusLabel[s]}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
