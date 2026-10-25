import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Layout() {
  const { user, isAdmin, isCustomer, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/shows" className="brand">
            <span className="brand-logo" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1f2a44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 18v-6a8 8 0 0 1 16 0v6" /><path d="M4 18h16" /><path d="M8 18v-3h8v3" /></svg>
            </span>
            StageTix
          </NavLink>
          <nav className="nav" aria-label="ניווט ראשי">
            <NavLink to="/shows">הופעות</NavLink>
            {isCustomer && <NavLink to="/my-orders">ההזמנות שלי</NavLink>}
            {isAdmin && <NavLink to="/admin/shows">ניהול הופעות</NavLink>}
            {isAdmin && <NavLink to="/admin/orders">ניהול הזמנות</NavLink>}
          </nav>
          <div className="user">
            {user ? (
              <>
                <span>{user.fullName} {isAdmin && <span className="badge">מנהלת</span>}</span>
                <button className="btn btn-small" onClick={() => { logout(); navigate('/shows'); }}>התנתקות</button>
              </>
            ) : (
              <NavLink to="/login" className="btn btn-primary">התחברות</NavLink>
            )}
          </div>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
