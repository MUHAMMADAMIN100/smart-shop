import { Link } from 'react-router-dom';
import { Product } from '../types';
import { formatPrice } from '../utils/format';
import { useCompare } from '../store/compare';
import { api } from '../api';
import { useAuth } from '../store/auth';
import toast from 'react-hot-toast';
import { useState } from 'react';

export function ProductCard({ product }: { product: Product }) {
  const compare = useCompare();
  const { user } = useAuth();
  const [fav, setFav] = useState(false);

  const img = product.images[0]?.url;
  const minPrice = product.variants[0]?.price ?? product.basePrice;
  const finalPrice = product.discount
    ? Math.round(minPrice * (1 - product.discount / 100))
    : minPrice;

  const toggleFav = async () => {
    if (!user) return toast.error('Войдите, чтобы добавить в избранное');
    try {
      const { data } = await api.post(`/favorites/toggle/${product.id}`);
      setFav(data.favorite);
      toast.success(data.favorite ? 'Добавлено в избранное' : 'Убрано из избранного');
    } catch {
      toast.error('Ошибка');
    }
  };

  return (
    <div className="card group overflow-hidden hover:shadow-md transition">
      <Link to={`/product/${product.slug}`} className="block aspect-square bg-slate-50 overflow-hidden">
        {img && (
          <img
            src={img}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition"
          />
        )}
      </Link>
      <div className="p-4 flex flex-col gap-2">
        <div className="text-xs text-slate-500 uppercase tracking-wide">{product.brand.name}</div>
        <Link
          to={`/product/${product.slug}`}
          className="font-medium text-slate-900 line-clamp-2 hover:text-brand-600 min-h-[3rem]"
        >
          {product.title}
        </Link>

        {product.rating > 0 && (
          <div className="flex items-center gap-1 text-sm">
            <span className="text-amber-500">★</span>
            <span>{product.rating.toFixed(1)}</span>
            <span className="text-slate-400">({product.reviewsCount})</span>
          </div>
        )}

        <div className="flex items-baseline gap-2">
          <div className="text-lg font-bold">{formatPrice(finalPrice)}</div>
          {product.discount > 0 && (
            <div className="text-sm text-slate-400 line-through">{formatPrice(minPrice)}</div>
          )}
        </div>

        <div className="flex gap-2 mt-auto">
          <Link to={`/product/${product.slug}`} className="btn-primary flex-1">Подробнее</Link>
          <button
            onClick={toggleFav}
            className={`btn-secondary px-2 ${fav ? 'text-rose-600' : ''}`}
            aria-label="favorite"
          >
            ♡
          </button>
          <button
            onClick={() => compare.toggle(product.id)}
            className={`btn-secondary px-2 ${compare.has(product.id) ? 'text-brand-600' : ''}`}
            aria-label="compare"
            title="Сравнить"
          >
            ⇄
          </button>
        </div>
      </div>
    </div>
  );
}
