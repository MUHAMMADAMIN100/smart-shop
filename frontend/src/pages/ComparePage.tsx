import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Product } from '../types';
import { useCompare } from '../store/compare';
import { formatPrice } from '../utils/format';

export default function ComparePage() {
  const compare = useCompare();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (compare.ids.length === 0) {
      setProducts([]);
      return;
    }
    api.get<Product[]>('/products/compare', { params: { ids: compare.ids.join(',') } })
      .then((r) => setProducts(r.data));
  }, [compare.ids]);

  if (compare.ids.length === 0)
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="text-5xl mb-4">⇄</div>
        <h1 className="text-2xl font-bold mb-2">Пока нет товаров для сравнения</h1>
        <p className="text-slate-500 mb-6">Добавьте телефоны кнопкой ⇄ на карточке товара.</p>
        <Link to="/" className="btn-primary">В каталог</Link>
      </div>
    );

  const rows: Array<[string, (p: Product) => string]> = [
    ['Цена от', (p) => formatPrice(p.variants[0]?.price ?? p.basePrice)],
    ['Бренд', (p) => p.brand.name],
    ['Год', (p) => String(p.releaseYear ?? '—')],
    ['Экран', (p) => p.screenSize ? `${p.screenSize}" ${p.screenType ?? ''}` : '—'],
    ['Разрешение', (p) => p.resolution ?? '—'],
    ['Частота', (p) => p.refreshRate ? `${p.refreshRate} Гц` : '—'],
    ['Процессор', (p) => p.processor ?? '—'],
    ['Батарея', (p) => p.batteryMah ? `${p.batteryMah} мАч` : '—'],
    ['Камеры', (p) => p.camerasMp ? `${p.camerasMp} Мп` : '—'],
    ['ОС', (p) => p.os ?? '—'],
    ['Вес', (p) => p.weight ? `${p.weight} г` : '—'],
    ['Защита', (p) => p.waterproof ?? '—'],
    ['Рейтинг', (p) => p.rating ? `★ ${p.rating.toFixed(1)}` : '—'],
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Сравнение</h1>
        <button onClick={compare.clear} className="btn-ghost text-rose-600">Очистить</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="text-left w-40"></th>
              {products.map((p) => (
                <th key={p.id} className="p-2 align-top min-w-[180px]">
                  <div className="flex flex-col items-center text-center">
                    {p.images[0] && <img src={p.images[0].url} className="w-28 h-28 object-contain mb-2" />}
                    <Link to={`/product/${p.slug}`} className="font-semibold hover:text-brand-600">{p.title}</Link>
                    <button
                      onClick={() => compare.toggle(p.id)}
                      className="text-xs text-rose-600 mt-1"
                    >Убрать</button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, get]) => (
              <tr key={label} className="border-t border-slate-100">
                <td className="p-2 text-slate-500">{label}</td>
                {products.map((p) => (
                  <td key={p.id} className="p-2 font-medium text-center">{get(p)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
