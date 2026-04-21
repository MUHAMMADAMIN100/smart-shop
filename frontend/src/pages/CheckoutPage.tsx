import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../api';
import { useCart } from '../store/cart';
import { Address } from '../types';
import { formatPrice } from '../utils/format';

export default function CheckoutPage() {
  const cart = useCart();
  const nav = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Россия');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { cart.fetch(); }, []);
  useEffect(() => {
    api.get<Address[]>('/addresses').then((r) => {
      setAddresses(r.data);
      const d = r.data.find((a) => a.isDefault) ?? r.data[0];
      if (d) selectAddress(d);
    });
  }, []);

  const selectAddress = (a: Address) => {
    setAddressId(a.id);
    setFullName(a.fullName);
    setPhone(a.phone);
    setCountry(a.country);
    setCity(a.city);
    setStreet(a.street);
    setPostalCode(a.postalCode ?? '');
  };

  const subtotal = cart.total();
  const shipping = subtotal >= 50000 ? 0 : 500;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/orders', {
        addressId: addressId || undefined,
        fullName, phone, country, city, street, postalCode,
        note,
      });
      toast.success('Заказ оформлен!');
      await cart.fetch();
      nav(`/orders/${data.id}`);
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Ошибка оформления');
    } finally {
      setSaving(false);
    }
  };

  if (cart.items.length === 0)
    return <div className="p-8 text-center">Корзина пуста</div>;

  return (
    <form onSubmit={submit} className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Оформление заказа</h1>

        {addresses.length > 0 && (
          <div className="card p-4">
            <div className="label">Выбрать сохранённый адрес</div>
            <div className="flex flex-wrap gap-2">
              {addresses.map((a) => (
                <button
                  type="button"
                  key={a.id}
                  onClick={() => selectAddress(a)}
                  className={`px-3 py-2 border rounded-lg text-sm ${addressId === a.id ? 'border-brand-600 bg-brand-50' : 'border-slate-200'}`}
                >
                  {a.city}, {a.street} {a.isDefault && '★'}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="card p-4 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <div className="label">ФИО получателя</div>
              <input required className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <div className="label">Телефон</div>
              <input required className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <div className="label">Страна</div>
              <input required className="input" value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
            <div>
              <div className="label">Город</div>
              <input required className="input" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
          </div>
          <div className="grid md:grid-cols-[1fr_160px] gap-3">
            <div>
              <div className="label">Улица, дом, квартира</div>
              <input required className="input" value={street} onChange={(e) => setStreet(e.target.value)} />
            </div>
            <div>
              <div className="label">Индекс</div>
              <input className="input" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
            </div>
          </div>
          <div>
            <div className="label">Комментарий к заказу</div>
            <textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>
      </div>

      <aside className="card p-4 h-fit sticky top-20">
        <h3 className="font-semibold mb-3">Ваш заказ</h3>
        <div className="space-y-2 text-sm max-h-60 overflow-auto">
          {cart.items.map((it) => (
            <div key={it.id} className="flex justify-between">
              <span className="text-slate-700 line-clamp-1 pr-2">
                {it.variant.product.title} × {it.quantity}
              </span>
              <span>{formatPrice(it.variant.price * it.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-200 my-3" />
        <div className="flex justify-between text-sm"><span>Товары</span><span>{formatPrice(subtotal)}</span></div>
        <div className="flex justify-between text-sm"><span>Доставка</span><span>{shipping === 0 ? 'Бесплатно' : formatPrice(shipping)}</span></div>
        <div className="flex justify-between text-lg font-bold mt-2"><span>Итого</span><span>{formatPrice(subtotal + shipping)}</span></div>
        <button type="submit" disabled={saving} className="btn-primary w-full mt-4">
          {saving ? 'Оформляем…' : 'Подтвердить заказ'}
        </button>
        <div className="text-xs text-slate-500 mt-2">Оплата при получении</div>
      </aside>
    </form>
  );
}
