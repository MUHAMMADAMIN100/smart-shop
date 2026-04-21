import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../api';
import { Brand, Category, Product } from '../../types';

interface VariantInput {
  color: string;
  colorHex: string;
  storageGb: number;
  ramGb: number;
  price: number;
  stock: number;
  sku: string;
}

interface ImageInput {
  url: string;
  alt: string;
}

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const nav = useNavigate();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [f, setF] = useState({
    slug: '', title: '', description: '',
    brandId: '', categoryId: '',
    basePrice: 0, discount: 0, releaseYear: new Date().getFullYear(),
    screenSize: 6, screenType: '', resolution: '', refreshRate: 60,
    processor: '', batteryMah: 4000, camerasMp: '', os: 'Android 14',
    weight: 180, waterproof: '', isFeatured: false, isActive: true,
  });
  const [variants, setVariants] = useState<VariantInput[]>([
    { color: '', colorHex: '#000000', storageGb: 128, ramGb: 8, price: 0, stock: 0, sku: '' },
  ]);
  const [images, setImages] = useState<ImageInput[]>([{ url: '', alt: '' }]);

  useEffect(() => {
    api.get<Brand[]>('/brands').then((r) => setBrands(r.data));
    api.get<Category[]>('/categories').then((r) => setCats(r.data));
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      api.get('/products', { params: { pageSize: 100 } }).then(({ data }) => {
        const found = data.items.find((x: Product) => x.id === id);
        if (!found) return;
        return api.get<Product>(`/products/${found.slug}`).then((r) => {
          const p = r.data;
          setF({
            slug: p.slug, title: p.title, description: p.description,
            brandId: p.brand.id, categoryId: p.category.id,
            basePrice: p.basePrice, discount: p.discount,
            releaseYear: p.releaseYear ?? new Date().getFullYear(),
            screenSize: p.screenSize ?? 6, screenType: p.screenType ?? '',
            resolution: p.resolution ?? '', refreshRate: p.refreshRate ?? 60,
            processor: p.processor ?? '', batteryMah: p.batteryMah ?? 4000,
            camerasMp: p.camerasMp ?? '', os: p.os ?? '',
            weight: p.weight ?? 180, waterproof: p.waterproof ?? '',
            isFeatured: p.isFeatured, isActive: p.isActive !== false,
          });
          setVariants(p.variants.map((v) => ({
            color: v.color, colorHex: v.colorHex ?? '#000000',
            storageGb: v.storageGb, ramGb: v.ramGb,
            price: v.price, stock: v.stock, sku: v.sku,
          })));
          setImages(p.images.map((i) => ({ url: i.url, alt: i.alt ?? '' })));
        });
      });
    }
  }, [id, isEdit]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const body = {
        ...f,
        variants: variants.map((v) => ({ ...v, price: Number(v.price), stock: Number(v.stock), storageGb: Number(v.storageGb), ramGb: Number(v.ramGb) })),
        images: images.filter((i) => i.url).map((i, order) => ({ ...i, order })),
      };
      if (isEdit) {
        await api.patch(`/products/${id}`, body);
        toast.success('Сохранено');
      } else {
        await api.post('/products', body);
        toast.success('Создано');
      }
      nav('/admin/products');
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Ошибка');
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <h1 className="text-2xl font-bold">{isEdit ? 'Редактировать' : 'Новый товар'}</h1>

      <div className="card p-4 space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="Название"><input required className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
          <Field label="Slug"><input required className="input" value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} placeholder="iphone-15-pro" /></Field>
          <Field label="Бренд">
            <select required className="input" value={f.brandId} onChange={(e) => setF({ ...f, brandId: e.target.value })}>
              <option value="">—</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
          <Field label="Категория">
            <select required className="input" value={f.categoryId} onChange={(e) => setF({ ...f, categoryId: e.target.value })}>
              <option value="">—</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Базовая цена"><input required type="number" className="input" value={f.basePrice} onChange={(e) => setF({ ...f, basePrice: Number(e.target.value) })} /></Field>
          <Field label="Скидка, %"><input type="number" className="input" value={f.discount} onChange={(e) => setF({ ...f, discount: Number(e.target.value) })} /></Field>
        </div>
        <Field label="Описание"><textarea required rows={3} className="input" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>

        <details className="text-sm"><summary className="cursor-pointer font-medium">Характеристики</summary>
          <div className="grid md:grid-cols-3 gap-3 mt-2">
            <Field label="Год"><input type="number" className="input" value={f.releaseYear} onChange={(e) => setF({ ...f, releaseYear: Number(e.target.value) })} /></Field>
            <Field label='Экран, "'><input type="number" step="0.1" className="input" value={f.screenSize} onChange={(e) => setF({ ...f, screenSize: Number(e.target.value) })} /></Field>
            <Field label="Тип"><input className="input" value={f.screenType} onChange={(e) => setF({ ...f, screenType: e.target.value })} /></Field>
            <Field label="Разрешение"><input className="input" value={f.resolution} onChange={(e) => setF({ ...f, resolution: e.target.value })} /></Field>
            <Field label="Частота, Гц"><input type="number" className="input" value={f.refreshRate} onChange={(e) => setF({ ...f, refreshRate: Number(e.target.value) })} /></Field>
            <Field label="Процессор"><input className="input" value={f.processor} onChange={(e) => setF({ ...f, processor: e.target.value })} /></Field>
            <Field label="Батарея, мАч"><input type="number" className="input" value={f.batteryMah} onChange={(e) => setF({ ...f, batteryMah: Number(e.target.value) })} /></Field>
            <Field label="Камеры, Мп"><input className="input" value={f.camerasMp} onChange={(e) => setF({ ...f, camerasMp: e.target.value })} /></Field>
            <Field label="ОС"><input className="input" value={f.os} onChange={(e) => setF({ ...f, os: e.target.value })} /></Field>
            <Field label="Вес, г"><input type="number" className="input" value={f.weight} onChange={(e) => setF({ ...f, weight: Number(e.target.value) })} /></Field>
            <Field label="Защита"><input className="input" value={f.waterproof} onChange={(e) => setF({ ...f, waterproof: e.target.value })} /></Field>
          </div>
        </details>

        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.isFeatured} onChange={(e) => setF({ ...f, isFeatured: e.target.checked })} />Рекомендуемый</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.isActive} onChange={(e) => setF({ ...f, isActive: e.target.checked })} />Активен</label>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Варианты</h3>
          <button type="button" onClick={() => setVariants([...variants, { color: '', colorHex: '#000', storageGb: 128, ramGb: 8, price: 0, stock: 0, sku: '' }])} className="btn-secondary">+</button>
        </div>
        <div className="space-y-2">
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-2 md:grid-cols-7 gap-2 text-xs">
              <input required placeholder="Цвет" className="input" value={v.color} onChange={(e) => update(i, { color: e.target.value })} />
              <input type="color" className="input h-9" value={v.colorHex} onChange={(e) => update(i, { colorHex: e.target.value })} />
              <input required type="number" placeholder="Память" className="input" value={v.storageGb} onChange={(e) => update(i, { storageGb: Number(e.target.value) })} />
              <input required type="number" placeholder="RAM" className="input" value={v.ramGb} onChange={(e) => update(i, { ramGb: Number(e.target.value) })} />
              <input required type="number" placeholder="Цена" className="input" value={v.price} onChange={(e) => update(i, { price: Number(e.target.value) })} />
              <input required type="number" placeholder="Остаток" className="input" value={v.stock} onChange={(e) => update(i, { stock: Number(e.target.value) })} />
              <div className="flex gap-1">
                <input required placeholder="SKU" className="input" value={v.sku} onChange={(e) => update(i, { sku: e.target.value })} />
                <button type="button" onClick={() => setVariants(variants.filter((_, x) => x !== i))} className="btn-ghost text-rose-600">×</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Изображения (URL)</h3>
          <button type="button" onClick={() => setImages([...images, { url: '', alt: '' }])} className="btn-secondary">+</button>
        </div>
        <div className="space-y-2">
          {images.map((im, i) => (
            <div key={i} className="flex gap-2 items-center">
              {im.url && <img src={im.url} className="w-12 h-12 object-cover rounded" />}
              <input required placeholder="https://…" className="input" value={im.url} onChange={(e) => updateImg(i, { url: e.target.value })} />
              <input placeholder="alt" className="input max-w-[160px]" value={im.alt} onChange={(e) => updateImg(i, { alt: e.target.value })} />
              <button type="button" onClick={() => setImages(images.filter((_, x) => x !== i))} className="btn-ghost text-rose-600">×</button>
            </div>
          ))}
        </div>
      </div>

      <button className="btn-primary">{isEdit ? 'Сохранить' : 'Создать'}</button>
    </form>
  );

  function update(i: number, patch: Partial<VariantInput>) {
    setVariants(variants.map((x, idx) => idx === i ? { ...x, ...patch } : x));
  }
  function updateImg(i: number, patch: Partial<ImageInput>) {
    setImages(images.map((x, idx) => idx === i ? { ...x, ...patch } : x));
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="label">{label}</div>{children}</div>;
}
