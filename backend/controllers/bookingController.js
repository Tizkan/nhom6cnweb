const db = require("../config/db");

//Lấy danh sách booking
//JOIN 3 bảng: Bookings + Customers + Rooms để lấy đầy đủ thông tin hiển thị.
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

//Tạo booking mới
//Booking mới luôn có status mặc định là
// "Chờ Xác Nhận". Dấu ? là prepared statement — chống SQL Injection.
exports.createBooking = (req, res) => {
  const { customer_id, room_id, check_in, check_out } = req.body;

  //tính số đêm
  const nights = Math.ceil(
    (new Date(check_out) - new Date(check_in)) / (1000 * 60 * 60 * 24),
  );

  db.query(
    `SELECT rt.price FROM Rooms r
     JOIN room_types rt ON r.room_type_id = rt.id
     WHERE r.id = ?`,
    [room_id],
    (err, rows) => {
      if (err || !rows.length)
        return res.status(500).json({ message: "Không tìm thấy phòng" });

      //bỏ kiểu số thập phân và * cho số đêm ra giá tiền
      const total_amount = parseFloat(rows[0].price) * nights;

      db.query(
        `INSERT INTO Bookings 
          (customer_id, room_id, check_in, check_out, total_amount, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          customer_id,
          room_id,
          check_in,
          check_out,
          total_amount,
          "Chờ Xác Nhận",
        ],
        (err2) => {
          if (err2) return res.status(500).json(err2);
          res.json({ success: true, total_amount });
        },
      );
    },
  );
};
//xóa booking theo id
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

//Cập nhật booking + đồng bộ trạng thái phòng
exports.updateBooking = (req, res) => {
  const id = req.params.id;
  const { customer_id, room_id, check_in, check_out, status } = req.body;

  //tính số đêm
  const nights = Math.ceil(
    (new Date(check_out) - new Date(check_in)) / (1000 * 60 * 60 * 24),
  );

  // Lấy giá phòng từ room_types để tính lại total_amount
  db.query(
    `SELECT rt.price FROM Rooms r
     JOIN room_types rt ON r.room_type_id = rt.id
     WHERE r.id = ?`,
    [room_id],
    (err, rows) => {
      if (err || !rows.length)
        return res.status(500).json({ message: "Không tìm thấy phòng" });

      const total_amount = parseFloat(rows[0].price) * nights;

      db.query(
        `UPDATE Bookings SET customer_id=?, room_id=?, check_in=?, check_out=?, status=?, total_amount=? WHERE id=?`,
        [customer_id, room_id, check_in, check_out, status, total_amount, id],
        (err2) => {
          if (err2) return res.status(500).json(err2);

          // Map booking status → room status
          const map = {
            "Chờ Xác Nhận": "available",
            "Đã Xác Nhận": "booked",
            "Đã Check-in": "occupied",
            "Đã Check-out": "cleaning",
            "Đang Bảo Trì": "maintenance",
          };

          const roomStatus = map[status?.trim()];
          if (roomStatus && room_id) {
            db.query(
              `UPDATE Rooms SET status=? WHERE id=?`,
              [roomStatus, room_id],
              (err3) => {
                if (err3) console.log(err3);
              },
            );
          }

          res.json({ success: true, total_amount });
        },
      );
    },
  );
};

//Lấy 1 booking theo ID
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

      res.json(result[0]); // result là array, lấy phần tử đầu tiên
    },
  );
};
//Cập nhật trạng thái sau thanh toán
exports.updatePaymentStatus = (req, res) => {
  const { ids } = req.body; // mảng id booking khi click nhiều id
  if (!ids || !ids.length)
    return res.status(400).json({ message: "Không có booking nào" });

  const placeholders = ids.map(() => "?").join(","); //"?,?,?"
  db.query(
    `UPDATE Bookings SET status = 'Đã Xác Nhận' WHERE id IN (${placeholders})`, //chứa các id đã thanh toán và đổi status
    ids,
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    },
  );
};
