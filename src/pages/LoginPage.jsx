import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/endpoints.js';
import { useAuth } from '../auth/AuthContext.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';

const DEMO_USERS = [
  { label: 'מנהלת', email: 'admin@example.com', password: 'Admin123!' },
  { label: 'דנה (קונה)', email: 'dana@example.com', password: 'Customer123!' },
  { label: 'נועה (קונה)', email: 'noa@example.com', password: 'Customer123!' }
];

/** Screen 1 — login and registration. The JWT is stored by the AuthProvider and sent on every request. */
export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={location.state?.from ?? '/shows'} replace />;

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'register') {
        await authApi.register(form.fullName, form.email, form.password);
      }
      await login(form.email, form.password);
      navigate(location.state?.from ?? '/shows', { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card narrow">
      <div className="tabs">
        <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>התחברות</button>
        <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>הרשמה</button>
      </div>

      <form onSubmit={submit} className="form">
        {mode === 'register' && (
          <label>שם מלא
            <input value={form.fullName} onChange={update('fullName')} required minLength={2} maxLength={100} />
          </label>
        )}
        <label>אימייל
          <input type="email" dir="ltr" value={form.email} onChange={update('email')} required />
        </label>
        <label>סיסמה
          <input type="password" dir="ltr" value={form.password} onChange={update('password')} required
                 minLength={mode === 'register' ? 8 : undefined} />
        </label>
        {mode === 'register' && <p className="muted small">לפחות 8 תווים, כולל אות וספרה.</p>}
        <ErrorBanner error={error} />
        <button className="btn btn-primary" disabled={busy}>{mode === 'login' ? 'התחברי' : 'הירשמי'}</button>
      </form>

      {mode === 'login' && (
        <div className="demo-users">
          <p className="muted small">משתמשי הדגמה — לחיצה ממלאת את הטופס:</p>
          {DEMO_USERS.map((d) => (
            <button key={d.email} className="btn btn-small" onClick={() => setForm({ ...form, email: d.email, password: d.password })}>
              {d.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
