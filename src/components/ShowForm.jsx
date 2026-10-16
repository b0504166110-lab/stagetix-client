import { useState } from 'react';
import { CATEGORY_LABELS, fromLocalInput, toLocalInput } from '../utils/format.js';

const EMPTY = { title: '', artist: '', description: '', startsAt: '', ticketPrice: '', category: 'Music' };

/** Create / edit form for a show (admin). The time is entered in local time and sent to the server in UTC. */
export default function ShowForm({ show, onSubmit, onCancel, busy }) {
  const [form, setForm] = useState(show ? { ...show, startsAt: toLocalInput(show.startsAt), description: show.description ?? '' } : EMPTY);
  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  function submit(e) {
    e.preventDefault();
    onSubmit({
      title: form.title.trim(),
      artist: form.artist.trim(),
      description: form.description.trim() || null,
      startsAt: fromLocalInput(form.startsAt),
      ticketPrice: Number(form.ticketPrice),
      category: form.category
    });
  }

  return (
    <form className="card form form-grid" onSubmit={submit}>
      <h2 className="span-2">{show ? `עריכת "${show.title}"` : 'הופעה חדשה'}</h2>
      <label>שם ההופעה<input value={form.title} onChange={update('title')} required minLength={2} maxLength={150} /></label>
      <label>אמן / להקה<input value={form.artist} onChange={update('artist')} required minLength={2} maxLength={100} /></label>
      <label>תאריך ושעה<input type="datetime-local" value={form.startsAt} onChange={update('startsAt')} required /></label>
      <label>מחיר כרטיס (₪)<input type="number" min="1" max="10000" step="1" value={form.ticketPrice} onChange={update('ticketPrice')} required /></label>
      <label>קטגוריה
        <select value={form.category} onChange={update('category')}>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="span-2">תיאור<textarea rows={2} maxLength={1000} value={form.description} onChange={update('description')} /></label>
      <div className="span-2 actions">
        <button className="btn btn-primary" disabled={busy}>{show ? 'שמירה' : 'יצירה כטיוטה'}</button>
        <button type="button" className="btn" onClick={onCancel}>ביטול</button>
      </div>
    </form>
  );
}
