/** Previous / next controls for a server-side PagedResult. */
export default function Pagination({ page, totalPages, totalCount, onChange }) {
  if (!totalCount) return null;

  return (
    <nav className="pagination" aria-label="דפדוף">
      <button className="btn" disabled={page <= 1} onClick={() => onChange(page - 1)}>→ הקודם</button>
      <span>עמוד {page} מתוך {totalPages} · {totalCount} תוצאות</span>
      <button className="btn" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>הבא ←</button>
    </nav>
  );
}
