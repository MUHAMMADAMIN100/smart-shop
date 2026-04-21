import { NavLink, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  const link = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded text-sm ${isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-100'}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid md:grid-cols-[220px_1fr] gap-6">
      <aside className="card p-3 h-fit">
        <div className="font-bold mb-2 text-brand-600">Админ-панель</div>
        <nav className="space-y-1">
          <NavLink to="/admin" end className={link}>Дашборд</NavLink>
          <NavLink to="/admin/products" className={link}>Товары</NavLink>
          <NavLink to="/admin/orders" className={link}>Заказы</NavLink>
          <NavLink to="/admin/users" className={link}>Пользователи</NavLink>
          <NavLink to="/admin/brands" className={link}>Бренды</NavLink>
        </nav>
      </aside>
      <main><Outlet /></main>
    </div>
  );
}
