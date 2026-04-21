import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Order } from '../types';
import { formatDate, formatPrice, orderStatusColor, orderStatusLabel } from '../utils/format';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => { api.get<Order[]>('/orders/my').then((r) => setOrders(r.data)); }, []);

  if (orders.length === 0)
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="text-5xl mb-4">📦</div>
        <h1 className="text-2xl font-bold mb-2">Пока нет заказов</h1>
        <Link to="/" className="btn-primary">В каталог</Link>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Мои заказы</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <Link key={o.id} to={`/orders/${o.id}`} className="card p-4 flex justify-between items-center hover:border-brand-500">
            <div>
              <div className="font-semibold">#{o.orderNumber}</div>
              <div className="text-sm text-slate-500">{formatDate(o.createdAt)}</div>
              <div className="text-sm">{o.items.length} товар(ов)</div>
            </div>
            <div className="text-right">
              <div className="font-bold">{formatPrice(o.total)}</div>
              <span className={`text-xs px-2 py-1 rounded ${orderStatusColor[o.status]}`}>
                {orderStatusLabel[o.status]}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
