import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../store/cart';
import { formatPrice } from '../utils/format';

export default function CartPage() {
  const cart = useCart();

  useEffect(() => { cart.fetch(); }, []);

  if (cart.loading && cart.items.length === 0)
    return <div className="p-8 text-center text-slate-500">Загрузка…</div>;

  if (cart.items.length === 0)
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="text-5xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold mb-2">Корзина пуста</h1>
        <p className="text-slate-500 mb-6">Самое время выбрать себе новый смартфон!</p>
        <Link to="/" className="btn-primary">Перейти в каталог</Link>
      </div>
    );

  const subtotal = cart.total();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-[1fr_320px] gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Корзина</h1>
        <div className="space-y-3">
          {cart.items.map((it) => {
            const img = it.variant.product.images[0]?.url;
            return (
              <div key={it.id} className="card p-3 flex gap-3">
                {img && <img src={img} className="w-24 h-24 object-cover rounded" />}
                <div className="flex-1">
                  <Link to={`/product/${it.variant.product.slug}`} className="font-medium hover:text-brand-600">
                    {it.variant.product.title}
                  </Link>
                  <div className="text-sm text-slate-500 mt-1">
                    {it.variant.color} · {it.variant.storageGb} ГБ / {it.variant.ramGb} ГБ
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      className="btn-secondary px-2 py-1"
                      disabled={it.quantity <= 1}
                      onClick={() => cart.update(it.id, it.quantity - 1)}
                    >−</button>
                    <span className="min-w-[2rem] text-center">{it.quantity}</span>
                    <button
                      className="btn-secondary px-2 py-1"
                      onClick={() => cart.update(it.id, it.quantity + 1)}
                    >+</button>
                    <button
                      className="btn-ghost text-rose-600 ml-auto"
                      onClick={() => cart.remove(it.id)}
                    >Удалить</button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatPrice(it.variant.price * it.quantity)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <aside className="card p-4 h-fit sticky top-20">
        <h3 className="font-semibold mb-3">Итого</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Товары</span><span>{formatPrice(subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Доставка</span><span>{subtotal >= 50000 ? 'Бесплатно' : formatPrice(500)}</span></div>
        </div>
        <div className="border-t border-slate-200 my-3" />
        <div className="flex justify-between text-lg font-bold">
          <span>К оплате</span>
          <span>{formatPrice(subtotal + (subtotal >= 50000 ? 0 : 500))}</span>
        </div>
        <Link to="/checkout" className="btn-primary w-full mt-4">Оформить заказ</Link>
      </aside>
    </div>
  );
}
