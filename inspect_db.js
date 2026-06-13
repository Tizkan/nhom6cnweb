const db = require('./backend/config/db');
const q1 = `SELECT id, customer_id, total_amount, status, created_at FROM bookings ORDER BY id`;
const q2 = `SELECT c.id, c.full_name, b.status, b.total_amount FROM customers c LEFT JOIN bookings b ON b.customer_id=c.id ORDER BY c.id, b.id`;
const q3 = `SELECT c.id, c.full_name, c.phone, c.email, c.address, c.citizen_id, c.created_at, COUNT(b.id) AS booking_count, COALESCE(SUM(CASE WHEN b.status IN ('Đã xác nhận', 'Đã Check-in', 'Đang ở') THEN b.total_amount ELSE 0 END), 0) AS total_spent, MAX(b.created_at) AS last_booking_date FROM customers c LEFT JOIN bookings b ON b.customer_id = c.id GROUP BY c.id, c.full_name, c.phone, c.email, c.address, c.citizen_id, c.created_at`;
function run(q) { return new Promise((resolve, reject) => db.query(q, (err, rows) => err ? reject(err) : resolve(rows))); }
Promise.all([run(q1), run(q2), run(q3)]).then(([r1, r2, r3]) => {
  console.log('BOOKINGS');
  console.table(r1);
  console.log('CUSTOMER JOINED BOOKINGS');
  console.table(r2);
  console.log('CUSTOMERS TOTAL SPENT');
  console.table(r3);
  db.end();
}).catch(err => { console.error(err); db.end(); process.exit(1); });
