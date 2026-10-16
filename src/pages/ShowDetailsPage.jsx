import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ordersApi, showsApi } from '../api/endpoints.js';
import { useAuth } from '../auth/AuthContext.jsx';
import ConflictDialog from '../components/ConflictDialog.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import SeatMap from '../components/SeatMap.jsx';
import { useApiData } from '../hooks/useApiData.js';
import { CATEGORY_LABELS, formatDate, formatPrice, seatLabel, SHOW_STATUS_LABELS } from '../utils/format.js';

const MAX_SEATS = 6;

/** Screen 3 — the seat map and the booking button (the limited resource). Screen 4 is the 409 dialog. */
export default function ShowDetailsPage() {
  const { id } = useParams();
  const { user, isCustomer } = useAuth();
  const show = useApiData(() => showsApi.get(id), [id]);
  const seats = useApiData(() => showsApi.seats(id), [id]);

  const [selected, setSelected] = useState([]);
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState(null);
  const [conflict, setConflict] = useState(null);
  const [takenIds, setTakenIds] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);

  const seatList = seats.data ?? [];
  const selectedSeats = seatList.filter((s) => selected.includes(s.id));
  const canBook = isCustomer && show.data?.status === 'OnSale';

  function toggle(seatId) {
    setLastOrder(null);
    setBookError(null);
    setSelected((current) =>
      current.includes(seatId) ? current.filter((x) => x !== seatId)
        : current.length >= MAX_SEATS ? current
          : [...current, seatId]);
  }

  async function book() {
    setBooking(true);
    setBookError(null);
    try {
      const order = await ordersApi.create(Number(id), selected);
      setLastOrder(order);
      setSelected([]);
      seats.reload();
      show.reload();
    } catch (err) {
      if (err.status === 409) setConflict(err);
      else setBookError(err);
    } finally {
      setBooking(false);
    }
  }

  // After a 409: reload the real seat map and mark the seats that were taken under us.
  function refreshAfterConflict() {
    setTakenIds(selected);
    setSelected([]);
    setConflict(null);
    seats.reload();
    show.reload();
  }

  if (show.error) return <ErrorBanner error={show.error} />;
  if (!show.data) return <p className="muted">טוען…</p>;
  const s = show.data;

  return (
    <>
      <Link to="/shows" className="muted">→ חזרה לרשימה</Link>
      <div className="show-header">
        <div>
          <span className="chip">{CATEGORY_LABELS[s.category]}</span>
          {s.status !== 'OnSale' && <span className="chip chip-warning">{SHOW_STATUS_LABELS[s.status]}</span>}
          <h1>{s.title}</h1>
          <div className="muted">{s.artist}</div>
          {s.description && <p>{s.description}</p>}
        </div>
        <div className="show-facts">
          <div>{formatDate(s.startsAt)}</div>
          <div>{formatPrice(s.ticketPrice)} לכרטיס</div>
          <div className={s.availableSeats <= 5 ? 'text-danger' : ''}>{s.availableSeats} מתוך {s.totalSeats} פנויים</div>
        </div>
      </div>

      {lastOrder && (
        <div className="banner banner-success" role="status">
          🎉 ההזמנה בוצעה! מספר הזמנה {lastOrder.id}: {lastOrder.seats.map(seatLabel).join(', ')} · סה"כ {formatPrice(lastOrder.totalPrice)}.{' '}
          <Link to="/my-orders">להזמנות שלי</Link>
        </div>
      )}
      {takenIds.length > 0 && !conflict && (
        <div className="banner banner-warning">הכיסאות המסומנים באדום נתפסו לפני שהספקת להזמין. בחרי כיסאות אחרים.</div>
      )}

      <ErrorBanner error={seats.error} />
      {seatList.length > 0 && (
        <SeatMap seats={seatList} selectedIds={selected} takenIds={takenIds} onToggle={toggle} disabled={!canBook || booking} />
      )}

      <div className="booking-bar">
        {!user && <span>כדי להזמין כרטיסים <Link to="/login" state={{ from: `/shows/${id}` }}>התחברי</Link>.</span>}
        {user && !isCustomer && <span className="muted">מנהלת האולם אינה יכולה להזמין כרטיסים.</span>}
        {user && isCustomer && s.status !== 'OnSale' && <span className="muted">ההופעה אינה במכירה.</span>}
        {canBook && (
          <>
            <span>
              {selectedSeats.length === 0
                ? `בחרי עד ${MAX_SEATS} כיסאות במפה`
                : `${selectedSeats.map(seatLabel).join(', ')} · סה"כ ${formatPrice(selectedSeats.length * s.ticketPrice)}`}
            </span>
            <button className="btn btn-primary" disabled={selected.length === 0 || booking} onClick={book}>
              {booking ? 'מזמינה…' : 'הזמיני'}
            </button>
          </>
        )}
      </div>
      <ErrorBanner error={bookError} />

      <ConflictDialog error={conflict} seats={selectedSeats} onRefresh={refreshAfterConflict} />
    </>
  );
}
