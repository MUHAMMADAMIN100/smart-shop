import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { Facets, PaginatedProducts } from '../types';
import { ProductCard } from '../components/ProductCard';
import { formatPrice } from '../utils/format';

export default function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<PaginatedProducts | null>(null);
  const [facets, setFacets] = useState<Facets | null>(null);
  const [loading, setLoading] = useState(false);

  const page = Number(params.get('page') ?? 1);

  useEffect(() => { api.get('/products/facets').then((r) => setFacets(r.data)); }, []);

  useEffect(() => {
    setLoading(true);
    const p: Record<string, string> = {};
    params.forEach((v, k) => { if (v) p[k] = v; });
    api.get('/products', { params: p })
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, [params]);

  const setParam = (k: string, v?: string | null) => {
    const next = new URLSearchParams(params);
    if (v === null || v === undefined || v === '') next.delete(k);
    else next.set(k, v);
    if (k !== 'page') next.delete('page');
    setParams(next);
  };

  const selectedBrand = params.get('brand') ?? '';
  const selectedSort = params.get('sort') ?? 'newest';
  const selectedStorage = params.get('storageGb') ?? '';
  const selectedRam = params.get('ramGb') ?? '';
  const selectedColor = params.get('color') ?? '';
  const minPrice = params.get('minPrice') ?? '';
  const maxPrice = params.get('maxPrice') ?? '';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-[260px_1fr] gap-6">
      <aside className="card p-4 h-fit sticky top-20">
        <h3 className="font-semibold mb-3">Фильтры</h3>

        <div className="mb-4">
          <div className="label">Бренд</div>
          <div className="space-y-1 max-h-60 overflow-auto">
            {facets?.brands.map((b) => (
              <label key={b.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="brand"
                  checked={selectedBrand === b.slug}
                  onChange={() => setParam('brand', b.slug)}
                />
                <span>{b.name}</span>
                <span className="ml-auto text-xs text-slate-400">{b.count}</span>
              </label>
            ))}
            {selectedBrand && (
              <button onClick={() => setParam('brand', null)} className="text-xs text-brand-600 mt-1">Сбросить</button>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="label">Цена</div>
          <div className="flex gap-2">
            <input
              type="number"
              className="input"
              placeholder={facets ? String(facets.priceMin) : 'от'}
              value={minPrice}
              onChange={(e) => setParam('minPrice', e.target.value)}
            />
            <input
              type="number"
              className="input"
              placeholder={facets ? String(facets.priceMax) : 'до'}
              value={maxPrice}
              onChange={(e) => setParam('maxPrice', e.target.value)}
            />
          </div>
        </div>

        {facets?.storageGb && facets.storageGb.length > 0 && (
          <div className="mb-4">
            <div className="label">Память</div>
            <div className="flex flex-wrap gap-1">
              {facets.storageGb.map((v) => (
                <button
                  key={v}
                  className={`px-2 py-1 text-xs rounded border ${selectedStorage === String(v) ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200'}`}
                  onClick={() => setParam('storageGb', selectedStorage === String(v) ? null : String(v))}
                >
                  {v} ГБ
                </button>
              ))}
            </div>
          </div>
        )}

        {facets?.ramGb && facets.ramGb.length > 0 && (
          <div className="mb-4">
            <div className="label">RAM</div>
            <div className="flex flex-wrap gap-1">
              {facets.ramGb.map((v) => (
                <button
                  key={v}
                  className={`px-2 py-1 text-xs rounded border ${selectedRam === String(v) ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200'}`}
                  onClick={() => setParam('ramGb', selectedRam === String(v) ? null : String(v))}
                >
                  {v} ГБ
                </button>
              ))}
            </div>
          </div>
        )}

        {facets?.colors && facets.colors.length > 0 && (
          <div>
            <div className="label">Цвет</div>
            <div className="flex flex-wrap gap-1">
              {facets.colors.slice(0, 10).map((c) => (
                <button
                  key={c}
                  className={`px-2 py-1 text-xs rounded border ${selectedColor === c ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200'}`}
                  onClick={() => setParam('color', selectedColor === c ? null : c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-slate-600">
            {data ? `Найдено ${data.total}` : 'Загрузка…'}
          </div>
          <select
            className="input max-w-[220px]"
            value={selectedSort}
            onChange={(e) => setParam('sort', e.target.value)}
          >
            <option value="newest">Новинки</option>
            <option value="price_asc">Цена ↑</option>
            <option value="price_desc">Цена ↓</option>
            <option value="rating">По рейтингу</option>
            <option value="popular">Популярные</option>
          </select>
        </div>

        {loading && <div className="text-slate-500">Загрузка…</div>}

        {data && data.items.length === 0 && !loading && (
          <div className="text-center py-16 text-slate-500">
            <div className="text-4xl mb-2">🔍</div>
            <div>Ничего не найдено. Попробуйте изменить фильтры.</div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {data?.items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {data && data.pages > 1 && (
          <div className="flex items-center justify-center gap-1 mt-8">
            {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setParam('page', String(n))}
                className={`px-3 py-1 rounded ${n === page ? 'bg-brand-600 text-white' : 'hover:bg-slate-100'}`}
              >
                {n}
              </button>
            ))}
          </div>
        )}

        {facets && (
          <div className="text-xs text-slate-400 mt-8">
            Диапазон цен: {formatPrice(facets.priceMin)} – {formatPrice(facets.priceMax)}
          </div>
        )}
      </div>
    </div>
  );
}
