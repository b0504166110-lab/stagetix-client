/** The hall: one button per seat. Teal = available, grey = sold, navy = selected, coral ring = just taken. */
export default function SeatMap({ seats, selectedIds, takenIds = [], onToggle, disabled }) {
  const rows = [...new Set(seats.map((s) => s.row))].sort((a, b) => a - b);

  return (
    <div className="hall">
      <div className="stage">במה</div>
      {rows.map((row) => (
        <div className="seat-row" key={row}>
          <span className="row-label">שורה {row}</span>
          {seats.filter((s) => s.row === row).sort((a, b) => a.number - b.number).map((seat) => {
            const sold = seat.status === 'Sold';
            const selected = selectedIds.includes(seat.id);
            const className = ['seat', sold ? 'seat-sold' : 'seat-free', selected && 'seat-selected', sold && takenIds.includes(seat.id) && 'seat-taken']
              .filter(Boolean).join(' ');
            return (
              <button
                key={seat.id}
                className={className}
                disabled={disabled || sold}
                onClick={() => onToggle(seat.id)}
                title={`שורה ${seat.row} כיסא ${seat.number}${sold ? ' (תפוס)' : ''}`}
                aria-label={`שורה ${seat.row} כיסא ${seat.number}${sold ? ', תפוס' : ''}`}
                aria-pressed={selected}
              >
                {seat.number}
              </button>
            );
          })}
          <span className="row-label">שורה {row}</span>
        </div>
      ))}
      <div className="legend">
        <span><i className="seat seat-free" /> פנוי</span>
        <span><i className="seat seat-selected" /> הבחירה שלך</span>
        <span><i className="seat seat-sold" /> תפוס</span>
      </div>
    </div>
  );
}
