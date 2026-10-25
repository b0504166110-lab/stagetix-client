import { seatLabel } from '../utils/format.js';

/**
 * Screen 4 — the 409 Conflict. The server rejected the whole order because a seat was taken
 * (already sold, or bought by someone else at the very same moment). Nothing was booked.
 */
export default function ConflictDialog({ error, seats, onRefresh }) {
  if (!error) return null;

  return (
    <div className="dialog-backdrop" role="alertdialog" aria-modal="true" aria-labelledby="conflict-title">
      <div className="dialog">
        <div className="dialog-icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5" /><path d="M12 16.5h.01" /></svg>
        </div>
        <h2 id="conflict-title">המקום נתפס!</h2>
        <p>
          אחד או יותר מהכיסאות שבחרת נתפס הרגע על ידי מישהי אחרת.
          <br />
          <strong>ההזמנה לא בוצעה</strong> — אף אחד מהכיסאות לא הוזמן.
        </p>
        {seats.length > 0 && (
          <p className="muted">ניסית להזמין: {seats.map(seatLabel).join(', ')}</p>
        )}
        <div className="banner banner-warning small" dir="ltr">
          HTTP 409 Conflict — {error.detail}
          {error.correlationId && <div>Correlation ID: <code>{error.correlationId}</code></div>}
        </div>
        <button className="btn btn-primary btn-block" onClick={onRefresh} autoFocus>רענני את המפה ובחרי שוב</button>
      </div>
    </div>
  );
}
