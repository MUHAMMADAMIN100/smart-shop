import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

export default function FavoritesPage() {
  const [items, setItems] = useState<Array<{ id: string; product: Product }>>([]);

  useEffect(() => { api.get('/favorites').then((r) => setItems(r.data)); }, []);

  if (items.length === 0)
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="text-5xl mb-4">♡</div>
        <h1 className="text-2xl font-bold mb-2">Пока нет избранного</h1>
        <Link to="/" className="btn-primary">В каталог</Link>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Избранное</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((x) => <ProductCard key={x.id} product={x.product} />)}
      </div>
    </div>
  );
}
