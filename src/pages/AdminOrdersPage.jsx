import { useState } from 'react';
import { ordersApi } from '../api/endpoints.js';
import ErrorBanner from '../components/ErrorBanner.jsx';
import OrdersTable from '../components/OrdersTable.jsx';
import Pagination from '../components/Pagination.jsx';
import { useAdminAction } from '../hooks/useAdminAction.js';
import { useApiData } from '../hooks/useApiData.js';
import { ORDER_STATUS_LABELS } from '../utils/format.js';

/** Screen 7 (admin) — every customer's orders, with paging, a status filter and cancellation. */
export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const list = useApiData(() => ordersApi.list({ page, pageSize: 10, status }), [page, status]);
  const { run, error, busy, message } = useAdminAction(list.reload);

  return (
    <>
      <h1>ניהול הזמנות</h1>
      {message && <div className="banner banner-success">{message}</div>}
      <ErrorBanner error={error ?? list.error} />

      <div className="filters">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="סטטוס">
          <option value="">כל ההזמנות</option>
          {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      {list.data && (
        <OrdersTable
          orders={list.data.items}
          showCustomer
          renderActions={(o) => o.status === 'Active' && (
            <button className="btn btn-small btn-danger" disabled={busy}
                    onClick={() => run(() => ordersApi.cancel(o.id), {
                      confirm: `לבטל את הזמנה ${o.id} של ${o.customerName}? הכיסאות יחזרו להיות פנויים.`,
                      success: `הזמנה ${o.id} בוטלה והכיסאות שוחררו.`
                    })}>
              ביטול
            </button>
          )}
        />
      )}
      {list.data && <Pagination {...list.data} onChange={setPage} />}
    </>
  );
}
