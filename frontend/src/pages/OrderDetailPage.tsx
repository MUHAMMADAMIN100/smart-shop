import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../api';
import { Order } from '../types';
import { formatDate, formatPrice, orderStatusColor, orderStatusLabel } from '../utils/format';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  const load = () => id && api.get<Order>(`/orders/${id}`).then((r) => setOrder(r.data));
  useEffect(() => { load(); }, [id]);

  if (!order) return <div className="p-8 text-center text-slate-500">Загрузка…</div>;

  const cancel = async () => {
    if (!confirm('Отменить заказ?')) return;
    try {
      await api.post(`/orders/${order.id}/cancel`);
      toast.success('Заказ отменён');
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Не удалось');
    }
  };

  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/orders" className="text-sm text-brand-600">← К списку заказов</Link>
      <div className="flex justify-between items-center mt-2 mb-4">
        <h1 className="text-2xl font-bold">Заказ #{order.orderNumber}</h1>
        <span className={`text-sm px-3 py-1 rounded ${orderStatusColor[order.status]}`}>
          {orderStatusLabel[order.status]}
        </span>
      </div>

      <div className="text-sm text-slate-500 mb-6">Оформлен {formatDate(order.createdAt)}</div>

      <div className="card p-4 mb-4">
        <h3 className="font-semibold mb-3">Товары</h3>
        <div className="space-y-2">
          {order.items.map((it) => (
            <div key={it.id} className="flex justify-between text-sm">
              <div>
                <div>{it.productTitle}</div>
                <div className="text-slate-500">{it.color} · {it.storageGb}/{it.ramGb} ГБ × {it.quantity}</div>
              </div>
              <div className="font-medium">{formatPrice(it.priceAtTime * it.quantity)}</div>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-200 my-3" />
        <div className="flex justify-between text-sm"><span>Товары</span><span>{formatPrice(order.subtotal)}</span></div>
        {order.discount > 0 && <div className="flex justify-between text-sm text-emerald-600"><span>Скидка</span><span>−{formatPrice(order.discount)}</span></div>}
        <div className="flex justify-between text-sm"><span>Доставка</span><span>{order.shipping === 0 ? 'Бесплатно' : formatPrice(order.shipping)}</span></div>
        <div className="flex justify-between text-lg font-bold mt-2"><span>Итого</span><span>{formatPrice(order.total)}</span></div>
      </div>

      <div className="card p-4 mb-4">
        <h3 className="font-semibold mb-2">Доставка</h3>
        <div className="text-sm">{order.shipFullName}, {order.shipPhone}</div>
        <div className="text-sm text-slate-600">
          {order.shipCountry}, {order.shipCity}, {order.shipStreet}
          {order.shipPostal ? `, ${order.shipPostal}` : ''}
        </div>
        {order.note && <div className="text-sm text-slate-500 mt-2">Комментарий: {order.note}</div>}
      </div>

      {canCancel && (
        <button onClick={cancel} className="btn-danger">Отменить заказ</button>
      )}
    </div>
  );
}
