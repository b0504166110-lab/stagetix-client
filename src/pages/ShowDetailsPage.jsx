import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ordersApi, showsApi } from '../api/endpoints.js';
import { useAuth } from '../auth/AuthContext.jsx';
import ConflictDialog from '../components/ConflictDialog.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import SeatMap from '../components/SeatMap.jsx';
import { useApiData } from '../hooks/useApiData.js';
import { CATEGORY_LABELS, formatLongDate, formatPrice, formatTime, seatLabel, SHOW_STATUS_LABELS } from '../utils/format.js';

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
      <Link to="/shows" className="back-link">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        חזרה לאירועים
      </Link>

      <section className={`event-bar cat-${s.category}`}>
        <div>
          <span className="chip">{CATEGORY_LABELS[s.category]}</span>
          {s.status !== 'OnSale' && <span className="chip chip-warning">{SHOW_STATUS_LABELS[s.status]}</span>}
          <h1>{s.title}</h1>
          <div className="event-artist">{s.artist}</div>
          {s.description && <p>{s.description}</p>}
        </div>
        <div className="show-facts">
          <span className="fact">{formatLongDate(s.startsAt)}</span>
          <span className="fact">{formatTime(s.startsAt)}</span>
          <span className="fact">{formatPrice(s.ticketPrice)} לכרטיס</span>
          <span className={`fact fact-dark`}>{s.availableSeats} מתוך {s.totalSeats} פנויים</span>
        </div>
      </section>

      {lastOrder && (
        <div className="banner banner-success" role="status">
          <strong>ההזמנה בוצעה!</strong> מספר הזמנה {lastOrder.id}: {lastOrder.seats.map(seatLabel).join(', ')} · סה"כ {formatPrice(lastOrder.totalPrice)}.{' '}
          <Link to="/my-orders">להזמנות שלי</Link>
        </div>
      )}
      {takenIds.length > 0 && !conflict && (
        <div className="banner banner-warning">הכיסאות המסומנים בטבעת אדומה נתפסו לפני שהספקת להזמין. בחרי כיסאות אחרים.</div>
      )}

      <ErrorBanner error={seats.error} />

      <div className="booking-layout">
        <div className="booking-main">
          {seatList.length > 0 && (
            <SeatMap seats={seatList} selectedIds={selected} takenIds={takenIds} onToggle={toggle} disabled={!canBook || booking} />
          )}
        </div>

        <aside className="booking-aside" aria-label="סיכום הזמנה">
          <h2>המקומות שלך</h2>

          {!user && <div className="empty-box">כדי להזמין כרטיסים <Link to="/login" state={{ from: `/shows/${id}` }}>התחברי</Link>.</div>}
          {user && !isCustomer && <div className="empty-box">מנהלת האולם אינה יכולה להזמין כרטיסים.</div>}
          {user && isCustomer && s.status !== 'OnSale' && <div className="empty-box">ההופעה אינה במכירה.</div>}

          {canBook && (
            <>
              {selectedSeats.length === 0 ? (
                <div className="empty-box">עדיין לא נבחרו מקומות.<br />בחרי עד {MAX_SEATS} כיסאות במפה.</div>
              ) : (
                <div className="picked-list">
                  {selectedSeats.map((seat) => (
                    <div className="picked" key={seat.id}>
                      <span className="picked-num">{seat.number}</span>
                      <span className="picked-text">{seatLabel(seat)}</span>
                      <span>{formatPrice(s.ticketPrice)}</span>
                      <button type="button" className="icon-btn" aria-label={`הסרת ${seatLabel(seat)}`} onClick={() => toggle(seat.id)} disabled={booking}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="totals">
                <div className="muted"><span>כרטיסים</span><span>{selectedSeats.length}</span></div>
                <div className="grand"><span>סה"כ</span><span>{formatPrice(selectedSeats.length * s.ticketPrice)}</span></div>
              </div>

              <button className="btn btn-primary btn-block" disabled={selected.length === 0 || booking} onClick={book}>
                {booking ? 'מזמינה…' : selected.length === 0 ? 'בחרי מקומות כדי להמשיך' : 'הזמיני'}
              </button>
            </>
          )}

          <ErrorBanner error={bookError} />

          <div className="hint">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>
            אפשר להזמין עד {MAX_SEATS} כיסאות בהזמנה אחת
          </div>
        </aside>
      </div>

      <ConflictDialog error={conflict} seats={selectedSeats} onRefresh={refreshAfterConflict} />
    </>
  );
}
