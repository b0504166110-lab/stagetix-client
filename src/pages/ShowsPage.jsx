import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { showsApi } from '../api/endpoints.js';
import ErrorBanner from '../components/ErrorBanner.jsx';
import Pagination from '../components/Pagination.jsx';
import { useApiData } from '../hooks/useApiData.js';
import { CATEGORY_LABELS, formatDay, formatMonth, formatPrice, formatTime } from '../utils/format.js';

const SORTS = {
  'Date-Asc': 'תאריך — הקרובות קודם',
  'Date-Desc': 'תאריך — הרחוקות קודם',
  'Price-Asc': 'מחיר — מהזול',
  'Price-Desc': 'מחיר — מהיקר'
};

// A decorative mini hall for the hero (t = teal, v = violet, c = coral, g = sold, s = selected).
const HERO_ROWS = [
  'ttgtttttgt', 'tttttgtttt',
  'vvvgvvvvvvgv', 'vvvvvvssvvvv', 'vgvvvvvvvvgv',
  'ccccgccccccc', 'cccccccgcccc'
];

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
const SeatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 18v-5a8 8 0 0 1 16 0v5M4 18h16" /></svg>
);

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
    () => showsApi.list({ page, pageSize: 12, search, category, sortBy, sortDirection }),
    [page, search, category, sort]
  );

  // Any filter change goes back to page 1.
  const setFilter = (changes) => {
    const next = { search, category, sort, page: 1, ...changes };
    setParams(Object.fromEntries(Object.entries(next).filter(([, v]) => v !== '' && v !== null)));
  };

  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <span className="hero-pill">עונת האירועים החדשה נפתחה</span>
          <h1>בוחרים מקום,<br /><span>נהנים מהערב.</span></h1>
          <p>כל האירועים באולם במקום אחד. רואים את מפת האולם, בוחרים בדיוק איפה לשבת ומזמינים בקליק.</p>

          <form className="filters" onSubmit={(e) => { e.preventDefault(); setFilter({ search: searchText.trim() }); }}>
            <input placeholder="חיפוש לפי שם הופעה או אמן" aria-label="חיפוש" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <button className="btn btn-sun">חיפוש</button>
          </form>
        </div>

        <div className="hero-hall" aria-hidden="true">
          <div className="hero-stage" />
          <div className="hero-seats">
            {HERO_ROWS.map((row, r) => (
              <div className="hero-row" key={r}>
                {[...row].map((c, i) => <span key={i} className={`dot dot-${c}`} />)}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-head">
        <h2>אירועים קרובים</h2>
        <div className="filters" style={{ margin: 0 }}>
          <select value={category} onChange={(e) => setFilter({ category: e.target.value })} aria-label="קטגוריה">
            <option value="">כל הקטגוריות</option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select value={sort} onChange={(e) => setFilter({ sort: e.target.value })} aria-label="מיון">
            {Object.entries(SORTS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
      </div>

      <ErrorBanner error={error} />
      {loading && <p className="muted">טוען…</p>}
      {data && data.items.length === 0 && <p className="muted">לא נמצאו הופעות.</p>}

      <div className="show-grid">
        {data?.items.map((show) => (
          <Link to={`/shows/${show.id}`} className="show-card" key={show.id}>
            <div className={`show-band cat-${show.category}`}>
              <div className="date-box">
                <strong>{formatDay(show.startsAt)}</strong>
                <span>{formatMonth(show.startsAt)}</span>
              </div>
              <span className="chip">{CATEGORY_LABELS[show.category]}</span>
            </div>
            <div className="show-body">
              <h3>{show.title}</h3>
              <div className="muted">{show.artist}</div>
              <div className="show-meta">
                <span><ClockIcon />{formatTime(show.startsAt)}</span>
                <span className={show.availableSeats <= 5 ? 'text-danger' : ''}><SeatIcon />
                  {show.availableSeats === 0 ? 'אזל!' : `${show.availableSeats} מקומות פנויים`}
                </span>
              </div>
              <div className="show-card-footer">
                <strong>{formatPrice(show.ticketPrice)}</strong>
                <span className="btn btn-primary btn-small">בחירת מקומות</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {data && <Pagination {...data} onChange={(p) => setFilter({ page: p })} />}
    </>
  );
}
