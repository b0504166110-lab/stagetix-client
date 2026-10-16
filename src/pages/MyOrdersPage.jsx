import { useState } from 'react';
import { ordersApi } from '../api/endpoints.js';
import ErrorBanner from '../components/ErrorBanner.jsx';
import OrdersTable from '../components/OrdersTable.jsx';
import Pagination from '../components/Pagination.jsx';
import { useApiData } from '../hooks/useApiData.js';

/** Screen 5 — the customer's own orders. The server returns only hers (the caller comes from the token). */
export default function MyOrdersPage() {
  const [page, setPage] = useState(1);
  const { data, error, loading } = useApiData(() => ordersApi.list({ page, pageSize: 10 }), [page]);

  return (
    <>
      <h1>ההזמנות שלי</h1>
      <ErrorBanner error={error} />
      {loading && <p className="muted">טוען…</p>}
      {data && <OrdersTable orders={data.items} />}
      {data && <Pagination {...data} onChange={setPage} />}
    </>
  );
}
