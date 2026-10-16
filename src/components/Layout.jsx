import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Layout() {
  const { user, isAdmin, isCustomer, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <header className="topbar">
        <NavLink to="/shows" className="brand">🎭 StageTix</NavLink>
        <nav className="nav">
          <NavLink to="/shows">הופעות</NavLink>
          {isCustomer && <NavLink to="/my-orders">ההזמנות שלי</NavLink>}
          {isAdmin && <NavLink to="/admin/shows">ניהול הופעות</NavLink>}
          {isAdmin && <NavLink to="/admin/orders">ניהול הזמנות</NavLink>}
        </nav>
        <div className="user">
          {user ? (
            <>
              <span>{user.fullName} {isAdmin && <span className="badge">מנהלת</span>}</span>
              <button className="btn btn-link" onClick={() => { logout(); navigate('/shows'); }}>התנתקות</button>
            </>
          ) : (
            <NavLink to="/login" className="btn btn-primary">התחברות</NavLink>
          )}
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
