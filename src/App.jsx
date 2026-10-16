import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import AdminOrdersPage from './pages/AdminOrdersPage.jsx';
import AdminShowsPage from './pages/AdminShowsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import MyOrdersPage from './pages/MyOrdersPage.jsx';
import ShowDetailsPage from './pages/ShowDetailsPage.jsx';
import ShowsPage from './pages/ShowsPage.jsx';

// HashRouter (URLs like /#/shows/1) works on any static host without extra rewrite rules.
export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/shows" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/shows" element={<ShowsPage />} />
            <Route path="/shows/:id" element={<ShowDetailsPage />} />
            <Route path="/my-orders" element={<RequireAuth role="Customer"><MyOrdersPage /></RequireAuth>} />
            <Route path="/admin/shows" element={<RequireAuth role="Admin"><AdminShowsPage /></RequireAuth>} />
            <Route path="/admin/orders" element={<RequireAuth role="Admin"><AdminOrdersPage /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/shows" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
