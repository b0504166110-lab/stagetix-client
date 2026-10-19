// Hebrew labels for the server's enum values, and display helpers.

export const CATEGORY_LABELS = { Music: 'מוזיקה', StandUp: 'הומור', Theater: 'תיאטרון', Kids: 'ילדים' };
export const SHOW_STATUS_LABELS = { Draft: 'טיוטה', OnSale: 'במכירה', Cancelled: 'בוטלה' };
export const ORDER_STATUS_LABELS = { Active: 'פעילה', Cancelled: 'בוטלה' };

export const formatDate = (iso) =>
  new Date(iso).toLocaleString('he-IL', { weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const formatPrice = (value) => `₪${Number(value).toLocaleString('he-IL')}`;

export const seatLabel = (seat) => `שורה ${seat.row} כיסא ${seat.number}`;

/** ISO (UTC) → value for <input type="datetime-local"> in the user's local time. */
export function toLocalInput(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** <input type="datetime-local"> value (local time) → ISO in UTC, as the server expects. */
export const fromLocalInput = (value) => new Date(value).toISOString();

const MESSAGES = {
  0: 'אין חיבור לשרת. ודאי שהשרת פועל ושכתובת השרת (VITE_API_URL) נכונה.',
  400: 'הבקשה אינה תקינה.',
  401: 'יש להתחבר כדי לבצע את הפעולה.',
  403: 'אין לך הרשאה לבצע את הפעולה הזו.',
  404: 'הפריט לא נמצא.',
  409: 'הפעולה מתנגשת במצב הנוכחי של הנתונים.',
  500: 'אירעה שגיאה בשרת. נסי שוב מאוחר יותר.'
};

/** A Hebrew message for an ApiError (the server's English detail is shown separately). */
export const errorMessage = (error) => MESSAGES[error?.status] ?? MESSAGES[500];
