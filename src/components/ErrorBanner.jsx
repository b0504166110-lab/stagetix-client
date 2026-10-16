import { errorMessage } from '../utils/format.js';

/** Shows an ApiError: a Hebrew explanation, the server's own message, field errors and the correlation id. */
export default function ErrorBanner({ error }) {
  if (!error) return null;

  const fieldErrors = Object.entries(error.errors ?? {});

  return (
    <div className="banner banner-error" role="alert">
      <strong>{errorMessage(error)}</strong>
      {error.detail && <div className="banner-detail" dir="ltr">{error.detail}</div>}
      {fieldErrors.length > 0 && (
        <ul className="banner-detail" dir="ltr">
          {fieldErrors.map(([field, messages]) => <li key={field}>{field}: {messages.join(' ')}</li>)}
        </ul>
      )}
      {error.correlationId && <div className="muted small">מזהה בקשה: <code>{error.correlationId}</code></div>}
    </div>
  );
}
