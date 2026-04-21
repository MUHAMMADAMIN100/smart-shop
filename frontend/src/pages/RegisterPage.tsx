import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../store/auth';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password, name, phone);
      nav('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Ошибка регистрации');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="card p-6">
        <h1 className="text-2xl font-bold mb-4">Регистрация</h1>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <div className="label">Имя</div>
            <input required className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <div className="label">Email</div>
            <input required type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <div className="label">Телефон</div>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7..." />
          </div>
          <div>
            <div className="label">Пароль (минимум 6 символов)</div>
            <input required minLength={6} type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button disabled={loading} className="btn-primary w-full">{loading ? 'Создаём…' : 'Зарегистрироваться'}</button>
        </form>
        <p className="text-sm text-slate-500 mt-3">
          Уже есть аккаунт? <Link to="/login" className="text-brand-600">Войти</Link>
        </p>
      </div>
    </div>
  );
}
