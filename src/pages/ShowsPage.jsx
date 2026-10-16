import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { showsApi } from '../api/endpoints.js';
import ErrorBanner from '../components/ErrorBanner.jsx';
import Pagination from '../components/Pagination.jsx';
import { useApiData } from '../hooks/useApiData.js';
import { CATEGORY_LABELS, formatDate, formatPrice } from '../utils/format.js';

const SORTS = {
  'Date-Asc': 'תאריך — הקרובות קודם',
  'Date-Desc': 'תאריך — הרחוקות קודם',
  'Price-Asc': 'מחיר — מהזול',
  'Price-Desc': 'מחיר — מהיקר'
};

/**
 * Screen 2 — the show list. Search, filter, sort and paging all run on the server
 * (the page only sends the query string). The filters live in the URL, so "back" keeps them.
 */
export default function ShowsPage() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') ?? 1);
  const search = params.get('search') ?? '';
  const category = params.get('category') ?? '';
  const sort = params.get('sort') ?? 'Date-Asc';
  const [searchText, setSearchText] = useState(search);

  const [sortBy, sortDirection] = sort.split('-');
  const { data, error, loading } = useApiData(
    () => showsApi.list({ page, pageSize: 10, search, category, sortBy, sortDirection }),
    [page, search, category, sort]
  );

  // Any filter change goes back to page 1.
  const setFilter = (changes) => {
    const next = { search, category, sort, page: 1, ...changes };
    setParams(Object.fromEntries(Object.entries(next).filter(([, v]) => v !== '' && v !== null)));
  };

  return (
    <>
      <h1>הופעות</h1>

      <form className="filters" onSubmit={(e) => { e.preventDefault(); setFilter({ search: searchText.trim() }); }}>
        <input placeholder="חיפוש לפי שם הופעה או אמן" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        <button className="btn">חיפוש</button>
        <select value={category} onChange={(e) => setFilter({ category: e.target.value })} aria-label="קטגוריה">
          <option value="">כל הקטגוריות</option>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select value={sort} onChange={(e) => setFilter({ sort: e.target.value })} aria-label="מיון">
          {Object.entries(SORTS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </form>

      <ErrorBanner error={error} />
      {loading && <p className="muted">טוען…</p>}
      {data && data.items.length === 0 && <p className="muted">לא נמצאו הופעות.</p>}

      <div className="show-grid">
        {data?.items.map((show) => (
          <Link to={`/shows/${show.id}`} className="show-card" key={show.id}>
            <span className="chip">{CATEGORY_LABELS[show.category]}</span>
            <h3>{show.title}</h3>
            <div className="muted">{show.artist}</div>
            <div>{formatDate(show.startsAt)}</div>
            <div className="show-card-footer">
              <strong>{formatPrice(show.ticketPrice)}</strong>
              <span className={show.availableSeats <= 5 ? 'text-danger' : 'muted'}>
                {show.availableSeats === 0 ? 'אזל!' : `${show.availableSeats} מקומות פנויים`}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {data && <Pagination {...data} onChange={(p) => setFilter({ page: p })} />}
    </>
  );
}
