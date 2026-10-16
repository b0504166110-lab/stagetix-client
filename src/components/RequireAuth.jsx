import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

/**
 * Hides a screen from users without the right role. This is only for convenience:
 * the real permission check happens on the server (401 / 403).
 */
export default function RequireAuth({ role, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && user.role !== role) {
    return (
      <div className="card">
        <h2>אין הרשאה</h2>
        <p>המסך הזה מיועד ל{role === 'Admin' ? 'מנהלת האולם' : 'קונות'} בלבד.</p>
        <Link to="/shows">חזרה להופעות</Link>
      </div>
    );
  }

  return children;
}
