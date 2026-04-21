import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api';
import { useAuth } from '../store/auth';
import { Address } from '../types';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editing, setEditing] = useState<Address | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { api.get<Address[]>('/addresses').then((r) => setAddresses(r.data)); }, []);

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    const { data } = await api.patch('/users/me', { name, phone });
    setUser(data);
    toast.success('Профиль обновлён');
  };

  const saveAddress = async (a: Omit<Address, 'id'> & { id?: string }) => {
    if (a.id) {
      const { data } = await api.patch(`/addresses/${a.id}`, a);
      setAddresses(addresses.map((x) => x.id === data.id ? data : x));
    } else {
      const { data } = await api.post('/addresses', a);
      setAddresses([data, ...addresses]);
    }
    setShowForm(false);
    setEditing(null);
  };

  const remove = async (id: string) => {
    await api.delete(`/addresses/${id}`);
    setAddresses(addresses.filter((a) => a.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Профиль</h1>
        <form onSubmit={saveProfile} className="card p-4 space-y-3">
          <div>
            <div className="label">Email</div>
            <input disabled className="input bg-slate-50" value={user?.email ?? ''} />
          </div>
          <div>
            <div className="label">Имя</div>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <div className="label">Телефон</div>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <button className="btn-primary">Сохранить</button>
        </form>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Адреса доставки</h2>
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-secondary">+ Добавить</button>
        </div>

        <div className="space-y-2">
          {addresses.map((a) => (
            <div key={a.id} className="card p-3 flex justify-between">
              <div>
                <div className="font-medium">
                  {a.fullName}, {a.phone}
                  {a.isDefault && <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">по умолчанию</span>}
                </div>
                <div className="text-sm text-slate-600">
                  {a.country}, {a.city}, {a.street}{a.postalCode ? `, ${a.postalCode}` : ''}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(a); setShowForm(true); }} className="btn-ghost">Изменить</button>
                <button onClick={() => remove(a.id)} className="btn-ghost text-rose-600">Удалить</button>
              </div>
            </div>
          ))}
        </div>

        {showForm && (
          <AddressForm
            initial={editing}
            onCancel={() => { setShowForm(false); setEditing(null); }}
            onSave={saveAddress}
          />
        )}
      </div>
    </div>
  );
}

function AddressForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: Address | null;
  onCancel: () => void;
  onSave: (a: Omit<Address, 'id'> & { id?: string }) => void;
}) {
  const [fullName, setFullName] = useState(initial?.fullName ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [country, setCountry] = useState(initial?.country ?? 'Россия');
  const [city, setCity] = useState(initial?.city ?? '');
  const [street, setStreet] = useState(initial?.street ?? '');
  const [postalCode, setPostalCode] = useState(initial?.postalCode ?? '');
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ id: initial?.id, fullName, phone, country, city, street, postalCode, isDefault });
      }}
      className="card p-4 mt-3 space-y-3"
    >
      <div className="grid md:grid-cols-2 gap-3">
        <div><div className="label">ФИО</div><input required className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
        <div><div className="label">Телефон</div><input required className="input" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        <div><div className="label">Страна</div><input required className="input" value={country} onChange={(e) => setCountry(e.target.value)} /></div>
        <div><div className="label">Город</div><input required className="input" value={city} onChange={(e) => setCity(e.target.value)} /></div>
        <div className="md:col-span-2"><div className="label">Улица</div><input required className="input" value={street} onChange={(e) => setStreet(e.target.value)} /></div>
        <div><div className="label">Индекс</div><input className="input" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} /></div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
        Использовать по умолчанию
      </label>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary">Сохранить</button>
        <button type="button" onClick={onCancel} className="btn-secondary">Отмена</button>
      </div>
    </form>
  );
}
