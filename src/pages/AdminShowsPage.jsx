import { useState } from 'react';
import { Link } from 'react-router-dom';
import { showsApi } from '../api/endpoints.js';
import ErrorBanner from '../components/ErrorBanner.jsx';
import Pagination from '../components/Pagination.jsx';
import ShowForm from '../components/ShowForm.jsx';
import { useAdminAction } from '../hooks/useAdminAction.js';
import { useApiData } from '../hooks/useApiData.js';
import { CATEGORY_LABELS, formatDate, formatPrice, SHOW_STATUS_LABELS } from '../utils/format.js';

/** Screen 6 (admin) — every show, including drafts and cancelled ones: create, edit, publish, cancel, delete. */
export default function AdminShowsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState(null); // null = closed, {} = new, show = edit
  const list = useApiData(() => showsApi.list({ page, pageSize: 10, status, sortBy: 'Date' }), [page, status]);
  const { run, error, busy, message } = useAdminAction(list.reload);

  async function save(values) {
    const ok = await run(
      () => (editing.id ? showsApi.update(editing.id, values) : showsApi.create(values)),
      { success: editing.id ? 'ההופעה עודכנה.' : 'ההופעה נוצרה כטיוטה. לחצי "פרסום" כדי לפתוח אותה למכירה.' });
    if (ok) setEditing(null);
  }

  return (
    <>
      <div className="page-title">
        <h1>ניהול הופעות</h1>
        {!editing && <button className="btn btn-primary" onClick={() => setEditing({})}>+ הופעה חדשה</button>}
      </div>

      {editing && <ShowForm show={editing.id ? editing : null} onSubmit={save} onCancel={() => setEditing(null)} busy={busy} />}
      {message && <div className="banner banner-success">{message}</div>}
      <ErrorBanner error={error ?? list.error} />

      <div className="filters">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="סטטוס">
          <option value="">כל הסטטוסים</option>
          {Object.entries(SHOW_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      {list.data && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>הופעה</th><th>קטגוריה</th><th>מועד</th><th>מחיר</th><th>פנויים</th><th>סטטוס</th><th>פעולות</th></tr>
            </thead>
            <tbody>
              {list.data.items.map((s) => (
                <tr key={s.id} className={s.status === 'Cancelled' ? 'row-muted' : ''}>
                  <td>{s.id}</td>
                  <td><Link to={`/shows/${s.id}`}>{s.title}</Link><div className="muted small">{s.artist}</div></td>
                  <td>{CATEGORY_LABELS[s.category]}</td>
                  <td className="small">{formatDate(s.startsAt)}</td>
                  <td>{formatPrice(s.ticketPrice)}</td>
                  <td>{s.availableSeats}/{s.totalSeats}</td>
                  <td><span className={`chip chip-${s.status}`}>{SHOW_STATUS_LABELS[s.status]}</span></td>
                  <td className="actions">
                    {s.status !== 'Cancelled' && (
                      <button className="btn btn-small" disabled={busy} onClick={() => setEditing(s)}>עריכה</button>
                    )}
                    {s.status === 'Draft' && (
                      <button className="btn btn-small" disabled={busy}
                              onClick={() => run(() => showsApi.setStatus(s.id, 'OnSale'), { success: `"${s.title}" פורסמה ונפתחה למכירה.` })}>
                        פרסום
                      </button>
                    )}
                    {s.status !== 'Cancelled' && (
                      <button className="btn btn-small btn-danger" disabled={busy}
                              onClick={() => run(() => showsApi.setStatus(s.id, 'Cancelled'), {
                                confirm: `לבטל את "${s.title}"? כל ההזמנות של ההופעה יבוטלו.`,
                                success: `"${s.title}" בוטלה, וכל ההזמנות שלה בוטלו.`
                              })}>
                        ביטול
                      </button>
                    )}
                    {s.status === 'Draft' && (
                      <button className="btn btn-small btn-danger" disabled={busy}
                              onClick={() => run(() => showsApi.remove(s.id), { confirm: `למחוק את הטיוטה "${s.title}"?`, success: 'הטיוטה נמחקה.' })}>
                        מחיקה
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {list.data && <Pagination {...list.data} onChange={setPage} />}
    </>
  );
}
