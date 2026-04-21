import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../store/auth';
import { useCart } from '../store/cart';
import { useCompare } from '../store/compare';
import { Product } from '../types';
import { formatPrice } from '../utils/format';

export function Navbar() {
  const { user, logout } = useAuth();
  const cartCount = useCart((s) => s.count());
  const compareCount = useCompare((s) => s.ids.length);
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [suggest, setSuggest] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (q.trim().length < 2) return setSuggest([]);
      try {
        const { data } = await api.get<Product[]>('/products/suggest', { params: { q } });
        setSuggest(data);
        setOpen(true);
      } catch {}
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center gap-4 px-4 h-16">
        <Link to="/" className="font-bold text-xl text-brand-600 tracking-tight">
          PhoneMarket
        </Link>

        <nav className="hidden md:flex items-center gap-6 ml-4 text-sm text-slate-600">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'text-slate-900' : '')}>Каталог</NavLink>
          <NavLink to="/compare" className={({ isActive }) => (isActive ? 'text-slate-900' : '')}>
            Сравнение {compareCount ? `(${compareCount})` : ''}
          </NavLink>
        </nav>

        <div ref={ref} className="relative flex-1 max-w-xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setOpen(false);
              navigate(`/?search=${encodeURIComponent(q)}`);
            }}
          >
            <input
              className="input h-10"
              placeholder="Поиск по модели, процессору…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => suggest.length && setOpen(true)}
            />
          </form>
          {open && suggest.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
              {suggest.map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 p-2 hover:bg-slate-50"
                >
                  {p.images[0] && (
                    <img src={p.images[0].url} className="w-10 h-10 object-cover rounded" />
                  )}
                  <div className="flex-1 text-sm">{p.title}</div>
                  <div className="text-sm font-medium">{formatPrice(p.basePrice)}</div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/favorites" className="btn-ghost">♡ Избранное</Link>
              <Link to="/cart" className="btn-ghost relative">
                Корзина {cartCount > 0 && <span className="ml-1 bg-brand-600 text-white text-xs rounded-full px-2">{cartCount}</span>}
              </Link>
              <div className="relative group">
                <button className="btn-ghost">{user.name ?? user.email}</button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                  <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-slate-50">Профиль</Link>
                  <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-slate-50">Заказы</Link>
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-slate-50 text-brand-600">Админ-панель</Link>
                  )}
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-rose-600">Выйти</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Войти</Link>
              <Link to="/register" className="btn-primary">Регистрация</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
