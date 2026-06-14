const db = require("../config/db");

exports.getBookings = (req, res) => {
  db.query(
    `
    SELECT
      b.id,
      c.full_name,
      r.room_number,
      b.check_in,
      b.check_out,
      b.adults,
      b.children,
      b.total_amount,
      b.status,
      b.created_at
    FROM Bookings b
    JOIN Customers c
      ON b.customer_id = c.id
    JOIN Rooms r
      ON b.room_id = r.id
    `,
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json(results);
    },
  );
};

exports.createBooking = (req, res) => {
  const { customer_id, room_id, check_in, check_out } = req.body;

  db.query(
    `
    INSERT INTO Bookings
    (
      customer_id,
      room_id,
      check_in,
      check_out,
      status
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [customer_id, room_id, check_in, check_out, "Chờ Xác Nhận"],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json({
        success: true,
      });
    },
  );
};

exports.deleteBooking = (req, res) => {
  const id = req.params.id;

  db.query(
    `
    DELETE FROM Bookings
    WHERE id = ?
    `,
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        success: true,
      });
    },
  );
};

exports.updateBooking = (req, res) => {
  const id = req.params.id;

  const { customer_id, room_id, check_in, check_out, status } = req.body;

  db.query(
    `
    UPDATE Bookings
    SET
      customer_id = ?,
      room_id = ?,
      check_in = ?,
      check_out = ?,
      status = ?
    WHERE id = ?
    `,
    [customer_id, room_id, check_in, check_out, status, id],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        success: true,
      });
    },
  );
};

exports.getBookingById = (req, res) => {
  const id = req.params.id;

  db.query(
    `
    SELECT *
    FROM Bookings
    WHERE id = ?
    `,
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json(result[0]);
    },
  );
};
exports.updatePaymentStatus = (req, res) => {
  const { ids } = req.body; // mảng id booking
  if (!ids || !ids.length) return res.status(400).json({ message: 'Không có booking nào' });

  const placeholders = ids.map(() => '?').join(',');
  db.query(
    `UPDATE Bookings SET status = 'Đã Xác Nhận' WHERE id IN (${placeholders})`,
    ids,
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
};