import { Link } from 'react-router-dom';
import { formatDate, formatPrice, ORDER_STATUS_LABELS, seatLabel } from '../utils/format.js';

/** The order table used by both "My orders" (customer) and "Manage orders" (admin). */
export default function OrdersTable({ orders, showCustomer = false, renderActions }) {
  if (orders.length === 0) return <p className="muted">אין הזמנות להצגה.</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            {showCustomer && <th>קונה</th>}
            <th>הופעה</th>
            <th>מושבים</th>
            <th>סה"כ</th>
            <th>סטטוס</th>
            <th>הוזמנה</th>
            {renderActions && <th />}
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className={o.status === 'Cancelled' ? 'row-muted' : ''}>
              <td>{o.id}</td>
              {showCustomer && <td>{o.customerName}</td>}
              <td><Link to={`/shows/${o.showId}`}>{o.showTitle}</Link><div className="muted small">{formatDate(o.showStartsAt)}</div></td>
              <td>{o.seats.map(seatLabel).join(', ')}</td>
              <td>{formatPrice(o.totalPrice)}</td>
              <td>
                <span className={`chip ${o.status === 'Cancelled' ? 'chip-warning' : 'chip-ok'}`}>{ORDER_STATUS_LABELS[o.status]}</span>
                {o.cancelledAt && <div className="muted small">{formatDate(o.cancelledAt)}</div>}
              </td>
              <td className="small">{formatDate(o.createdAt)}</td>
              {renderActions && <td>{renderActions(o)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
