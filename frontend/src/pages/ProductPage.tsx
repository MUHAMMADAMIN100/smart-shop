import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../api';
import { Product, ProductVariant } from '../types';
import { formatPrice, formatDate } from '../utils/format';
import { useCart } from '../store/cart';
import { useAuth } from '../store/auth';
import { useCompare } from '../store/compare';
import { ProductCard } from '../components/ProductCard';

type Tab = 'specs' | 'reviews' | 'qa';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [activeImg, setActiveImg] = useState(0);
  const [variant, setVariant] = useState<ProductVariant | null>(null);
  const [tab, setTab] = useState<Tab>('specs');
  const { user } = useAuth();
  const cart = useCart();
  const compare = useCompare();

  useEffect(() => {
    if (!slug) return;
    api.get<Product>(`/products/${slug}`).then((r) => {
      setProduct(r.data);
      setVariant(r.data.variants[0] ?? null);
      setActiveImg(0);
      if (user) api.post(`/recently-viewed/${r.data.id}`).catch(() => {});
    });
    api.get<Product[]>(`/products/${slug}/related`).then((r) => setRelated(r.data));
  }, [slug, user]);

  const colors = useMemo(() => {
    if (!product) return [];
    const map = new Map<string, ProductVariant>();
    for (const v of product.variants) if (!map.has(v.color)) map.set(v.color, v);
    return Array.from(map.values());
  }, [product]);

  const storageOptions = useMemo(() => {
    if (!product || !variant) return [];
    return product.variants.filter((v) => v.color === variant.color);
  }, [product, variant]);

  if (!product) return <div className="p-8 text-center text-slate-500">Загрузка…</div>;

  const image = product.images[activeImg]?.url ?? product.images[0]?.url;
  const finalPrice = variant
    ? product.discount
      ? Math.round(variant.price * (1 - product.discount / 100))
      : variant.price
    : product.basePrice;

  const handleAdd = async () => {
    if (!user) return toast.error('Войдите, чтобы добавить в корзину');
    if (!variant) return;
    try {
      await cart.add(variant.id, 1);
      toast.success('Добавлено в корзину');
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Ошибка');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="text-sm text-slate-500 mb-4">
        <Link to="/" className="hover:text-brand-600">Каталог</Link>
        <span className="mx-2">/</span>
        <Link to={`/?brand=${product.brand.slug}`} className="hover:text-brand-600">{product.brand.name}</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{product.title}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square bg-white rounded-xl border border-slate-200 overflow-hidden mb-3">
            {image && <img src={image} alt={product.title} className="w-full h-full object-contain" />}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {product.images.map((im, i) => (
              <button
                key={im.id}
                className={`aspect-square bg-white border rounded-lg overflow-hidden ${i === activeImg ? 'border-brand-600' : 'border-slate-200'}`}
                onClick={() => setActiveImg(i)}
              >
                <img src={im.url} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm text-slate-500 uppercase tracking-wide">{product.brand.name}</div>
          <h1 className="text-2xl md:text-3xl font-bold mt-1">{product.title}</h1>

          {product.rating > 0 && (
            <div className="flex items-center gap-2 mt-2 text-sm">
              <span className="text-amber-500">★ {product.rating.toFixed(1)}</span>
              <button onClick={() => setTab('reviews')} className="text-brand-600 hover:underline">
                {product.reviewsCount} отзывов
              </button>
            </div>
          )}

          <div className="flex items-baseline gap-3 mt-4">
            <div className="text-3xl font-bold">{formatPrice(finalPrice)}</div>
            {product.discount > 0 && variant && (
              <div className="text-lg text-slate-400 line-through">{formatPrice(variant.price)}</div>
            )}
            {product.discount > 0 && (
              <span className="bg-rose-100 text-rose-700 text-xs font-semibold px-2 py-1 rounded">
                −{product.discount}%
              </span>
            )}
          </div>

          <div className="mt-6">
            <div className="label">Цвет: <span className="font-normal text-slate-600">{variant?.color}</span></div>
            <div className="flex flex-wrap gap-2">
              {colors.map((v) => (
                <button
                  key={v.color}
                  onClick={() => setVariant(v)}
                  className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm ${variant?.color === v.color ? 'border-brand-600 bg-brand-50' : 'border-slate-200'}`}
                >
                  {v.colorHex && <span className="w-5 h-5 rounded-full border border-slate-200" style={{ background: v.colorHex }} />}
                  {v.color}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="label">Память и RAM</div>
            <div className="flex flex-wrap gap-2">
              {storageOptions.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVariant(v)}
                  className={`border rounded-lg px-3 py-2 text-sm ${variant?.id === v.id ? 'border-brand-600 bg-brand-50' : 'border-slate-200'}`}
                >
                  {v.storageGb} ГБ / {v.ramGb} ГБ RAM
                  <span className="ml-2 text-slate-500">{formatPrice(product.discount ? Math.round(v.price * (1 - product.discount / 100)) : v.price)}</span>
                </button>
              ))}
            </div>
          </div>

          {variant && (
            <div className="mt-4 text-sm">
              {variant.stock > 0 ? (
                <span className="text-emerald-600">В наличии: {variant.stock} шт</span>
              ) : (
                <span className="text-rose-600">Нет в наличии</span>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              disabled={!variant || variant.stock === 0}
              onClick={handleAdd}
              className="btn-primary flex-1 py-3 text-base"
            >
              В корзину
            </button>
            <button
              onClick={() => compare.toggle(product.id)}
              className={`btn-secondary ${compare.has(product.id) ? 'text-brand-600' : ''}`}
            >
              ⇄ Сравнить
            </button>
          </div>

          <p className="mt-6 text-slate-700 leading-relaxed">{product.description}</p>
        </div>
      </div>

      <div className="mt-12">
        <div className="border-b border-slate-200 flex gap-6">
          {(['specs', 'reviews', 'qa'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 border-b-2 text-sm ${tab === t ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500'}`}
            >
              {t === 'specs' && 'Характеристики'}
              {t === 'reviews' && `Отзывы (${product.reviews?.length ?? 0})`}
              {t === 'qa' && `Вопросы (${product.questions?.length ?? 0})`}
            </button>
          ))}
        </div>

        <div className="py-6">
          {tab === 'specs' && <SpecsTable product={product} />}
          {tab === 'reviews' && <ReviewsBlock product={product} onReload={() => slug && api.get<Product>(`/products/${slug}`).then((r) => setProduct(r.data))} />}
          {tab === 'qa' && <QaBlock product={product} onReload={() => slug && api.get<Product>(`/products/${slug}`).then((r) => setProduct(r.data))} />}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">Похожие модели</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function SpecsTable({ product }: { product: Product }) {
  const rows: Array<[string, unknown]> = [
    ['Год выпуска', product.releaseYear],
    ['Экран', product.screenSize ? `${product.screenSize}" ${product.screenType ?? ''}` : null],
    ['Разрешение', product.resolution],
    ['Частота обновления', product.refreshRate ? `${product.refreshRate} Гц` : null],
    ['Процессор', product.processor],
    ['Батарея', product.batteryMah ? `${product.batteryMah} мАч` : null],
    ['Камеры', product.camerasMp ? `${product.camerasMp} Мп` : null],
    ['ОС', product.os],
    ['Вес', product.weight ? `${product.weight} г` : null],
    ['Защита', product.waterproof],
  ];
  return (
    <table className="w-full max-w-xl text-sm">
      <tbody>
        {rows.filter(([, v]) => v).map(([k, v]) => (
          <tr key={k} className="border-b border-slate-100">
            <td className="py-2 text-slate-500 w-1/2">{k}</td>
            <td className="py-2 font-medium">{String(v)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ReviewsBlock({ product, onReload }: { product: Product; onReload: () => void }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!user) return toast.error('Войдите, чтобы оставить отзыв');
    if (body.length < 5) return toast.error('Отзыв слишком короткий');
    setSubmitting(true);
    try {
      await api.post('/reviews', { productId: product.id, rating, title, body });
      toast.success('Отзыв добавлен');
      setBody(''); setTitle(''); setRating(5);
      onReload();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Ошибка');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="card p-4 mb-4">
        <div className="font-semibold mb-2">Ваш отзыв</div>
        <div className="mb-2 flex gap-1 text-2xl">
          {[1,2,3,4,5].map((n) => (
            <button key={n} onClick={() => setRating(n)} className={n <= rating ? 'text-amber-500' : 'text-slate-300'}>★</button>
          ))}
        </div>
        <input className="input mb-2" placeholder="Заголовок (опционально)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="input mb-2" rows={3} placeholder="Ваш отзыв" value={body} onChange={(e) => setBody(e.target.value)} />
        <button disabled={submitting} onClick={submit} className="btn-primary">Отправить</button>
      </div>

      {product.reviews?.length === 0 && <div className="text-slate-500">Пока нет отзывов. Будьте первым!</div>}
      <div className="space-y-4">
        {product.reviews?.map((r) => (
          <div key={r.id} className="card p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-amber-500">{'★'.repeat(r.rating)}<span className="text-slate-300">{'★'.repeat(5 - r.rating)}</span></div>
              {r.verified && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Купил товар</span>}
              <span className="text-xs text-slate-400 ml-auto">{formatDate(r.createdAt)}</span>
            </div>
            {r.title && <div className="font-semibold">{r.title}</div>}
            <div className="text-sm text-slate-700">{r.body}</div>
            <div className="text-xs text-slate-400 mt-1">{r.user?.name ?? 'Пользователь'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QaBlock({ product, onReload }: { product: Product; onReload: () => void }) {
  const { user } = useAuth();
  const [ask, setAsk] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const submitQ = async () => {
    if (!user) return toast.error('Войдите, чтобы задать вопрос');
    if (ask.length < 3) return;
    await api.post('/questions', { productId: product.id, body: ask });
    setAsk(''); onReload();
  };

  const submitA = async (qid: string) => {
    const body = answers[qid]?.trim();
    if (!body) return;
    await api.post(`/questions/${qid}/answer`, { body });
    setAnswers({ ...answers, [qid]: '' });
    onReload();
  };

  return (
    <div>
      <div className="card p-4 mb-4">
        <div className="font-semibold mb-2">Задайте вопрос</div>
        <textarea className="input mb-2" rows={2} value={ask} onChange={(e) => setAsk(e.target.value)} placeholder="Например, поддерживает ли 5G?" />
        <button onClick={submitQ} className="btn-primary">Отправить</button>
      </div>

      {product.questions?.length === 0 && <div className="text-slate-500">Пока нет вопросов.</div>}
      <div className="space-y-4">
        {product.questions?.map((q) => (
          <div key={q.id} className="card p-4">
            <div className="font-semibold mb-1">Q: {q.body}</div>
            <div className="text-xs text-slate-400 mb-2">{q.user?.name ?? 'Пользователь'} • {formatDate(q.createdAt)}</div>
            <div className="space-y-2 pl-4 border-l-2 border-slate-100">
              {q.answers.map((a) => (
                <div key={a.id}>
                  <div className="text-sm">A: {a.body}</div>
                  <div className="text-xs text-slate-400">
                    {a.user?.name ?? 'Пользователь'}
                    {a.isOfficial && <span className="ml-2 text-brand-600">Официальный ответ</span>}
                  </div>
                </div>
              ))}
            </div>
            {user && (
              <div className="mt-2 flex gap-2">
                <input
                  className="input"
                  placeholder="Ваш ответ…"
                  value={answers[q.id] ?? ''}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                />
                <button onClick={() => submitA(q.id)} className="btn-secondary">Ответить</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
