import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Brand, PaginatedProducts } from '../types';
import { ProductCard } from '../components/ProductCard';

export default function HomePage() {
  const [featured, setFeatured] = useState<PaginatedProducts | null>(null);
  const [latest, setLatest] = useState<PaginatedProducts | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    api.get('/products', { params: { featured: 'true', pageSize: 4 } }).then((r) => setFeatured(r.data));
    api.get('/products', { params: { sort: 'newest', pageSize: 8 } }).then((r) => setLatest(r.data));
    api.get('/brands').then((r) => setBrands(r.data));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      <section className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 text-white p-8 md:p-12 overflow-hidden relative">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">Смартфоны твоей мечты</h1>
          <p className="opacity-90 mb-6">Флагманы и бюджетные модели с быстрой доставкой и гарантией.</p>
          <Link to="/?sort=rating" className="btn bg-white text-brand-700 hover:bg-slate-100">
            Выбрать телефон →
          </Link>
        </div>
      </section>

      {brands.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Бренды</h2>
          <div className="flex flex-wrap gap-3">
            {brands.map((b) => (
              <Link
                key={b.id}
                to={`/?brand=${b.slug}`}
                className="card px-6 py-4 hover:border-brand-500 hover:shadow-sm transition"
              >
                <div className="font-semibold">{b.name}</div>
                <div className="text-xs text-slate-500">{b.count ?? 0} моделей</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featured && featured.items.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Хиты продаж</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {latest && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Новинки</h2>
            <Link to="/" className="text-sm text-brand-600">Весь каталог →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {latest.items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
