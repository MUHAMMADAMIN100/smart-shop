import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../store/auth';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      nav(params.get('next') ?? '/');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Неверные данные');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="card p-6">
        <h1 className="text-2xl font-bold mb-4">Вход</h1>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <div className="label">Email</div>
            <input required type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <div className="label">Пароль</div>
            <input required type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button disabled={loading} className="btn-primary w-full">{loading ? 'Вход…' : 'Войти'}</button>
        </form>
        <p className="text-sm text-slate-500 mt-3">
          Нет аккаунта? <Link to="/register" className="text-brand-600">Зарегистрируйтесь</Link>
        </p>
        <div className="mt-4 p-3 bg-slate-50 rounded text-xs text-slate-500">
          Тест: <b>admin@shop.local</b> / <b>admin12345</b> (админ)<br/>
          Или: <b>user@shop.local</b> / <b>user12345</b>
        </div>
      </div>
    </div>
  );
}
