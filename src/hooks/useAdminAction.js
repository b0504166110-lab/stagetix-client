import { useState } from 'react';

/**
 * Runs an admin action (with an optional confirmation), shows its error, and reloads the list on success.
 * Shared by the "Manage shows" and "Manage orders" screens.
 */
export function useAdminAction(reload) {
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  async function run(action, { confirm: question, success } = {}) {
    if (question && !window.confirm(question)) return false;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await action();
      if (success) setMessage(success);
      reload();
      return true;
    } catch (err) {
      setError(err);
      return false;
    } finally {
      setBusy(false);
    }
  }

  return { run, error, busy, message };
}
