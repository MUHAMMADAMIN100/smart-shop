import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { formatDate, formatPrice, orderStatusLabel } from '../../utils/format';

interface Stats {
  usersCount: number;
  productsCount: number;
  ordersCount: number;
  revenue: number;
  recentOrders: Array<{ id: string; orderNumber: string; total: number; status: string; createdAt: string; user: { name: string | null; email: string } }>;
  ordersByStatus: Array<{ status: string; _count: number }>;
  topProducts: Array<{ title: string; sold: number; revenue: number }>;
}

export default function AdminDashboard() {
  const [s, setS] = useState<Stats | null>(null);

  useEffect(() => { api.get<Stats>('/admin/stats').then((r) => setS(r.data)); }, []);

  if (!s) return <div className="text-slate-500">Загрузка…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Дашборд</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Пользователи" value={s.usersCount} />
        <Stat label="Товары" value={s.productsCount} />
        <Stat label="Заказы" value={s.ordersCount} />
        <Stat label="Выручка" value={formatPrice(s.revenue)} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="font-semibold mb-3">Заказы по статусам</h3>
          <div className="space-y-2">
            {s.ordersByStatus.map((x) => (
              <div key={x.status} className="flex justify-between text-sm">
                <span>{orderStatusLabel[x.status]}</span>
                <span className="font-medium">{x._count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold mb-3">Топ товаров (30 дней)</h3>
          <div className="space-y-2 text-sm">
            {s.topProducts.length === 0 && <div className="text-slate-500">Нет данных</div>}
            {s.topProducts.map((t) => (
              <div key={t.title} className="flex justify-between">
                <span className="line-clamp-1 pr-2">{t.title}</span>
                <span className="text-slate-500">продано: {t.sold}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-semibold mb-3">Последние заказы</h3>
        <div className="divide-y divide-slate-100">
          {s.recentOrders.map((o) => (
            <Link to={`/admin/orders/${o.id}`} key={o.id} className="flex justify-between py-2 hover:bg-slate-50 rounded text-sm">
              <div>
                <div className="font-medium">#{o.orderNumber}</div>
                <div className="text-slate-500">{o.user.name ?? o.user.email} · {formatDate(o.createdAt)}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatPrice(o.total)}</div>
                <div className="text-xs text-slate-500">{orderStatusLabel[o.status]}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
