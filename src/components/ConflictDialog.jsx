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
        <div className="dialog-icon">😕</div>
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
        <button className="btn btn-primary" onClick={onRefresh} autoFocus>רענני את המפה ובחרי שוב</button>
      </div>
    </div>
  );
}
