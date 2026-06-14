const db = require("../config/db");

// =======================
// GET ALL ROOMS
// =======================
exports.getRooms = (req, res) => {
  db.query(
    `
    SELECT
      r.id,
      r.room_number,
      r.room_type_id,
      r.floor_number,
      r.status,
      rt.price AS price_per_night
    FROM Rooms r
    LEFT JOIN room_types rt ON r.room_type_id = rt.id
    `,
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }
      res.json(results);
    }
  );
};

// =======================
// GET ROOM BY ID
// =======================
exports.getRoomById = (req, res) => {
  const id = req.params.id;

  db.query(
    `SELECT * FROM Rooms WHERE id = ?`,
    [id],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }
      res.json(result[0]);
    }
  );
};

// =======================
// CREATE ROOM
// =======================
exports.createRoom = (req, res) => {
  const { room_number, room_type_id, floor_number, status } = req.body;

  db.query(
    `INSERT INTO Rooms (room_number, room_type_id, floor_number, status)
     VALUES (?, ?, ?, ?)`,
    [room_number, room_type_id, floor_number, status],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }
      res.json({
        success: true,
        message: "Thêm phòng thành công",
        id: result.insertId
      });
    }
  );
};

// =======================
// UPDATE ROOM
// =======================
exports.updateRoom = (req, res) => {
  const id = req.params.id;
  const { room_number, room_type_id, floor_number, status } = req.body;

  db.query(
    `UPDATE Rooms
     SET room_number = ?, room_type_id = ?, floor_number = ?, status = ?
     WHERE id = ?`,
    [room_number, room_type_id, floor_number, status, id],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      // Map trạng thái phòng → trạng thái booking
      let bookingStatus = null;
      const s = (status || '').trim();

      if (s === 'available') bookingStatus = 'Chờ Xác Nhận';
      else if (s === 'booked') bookingStatus = 'Đã Xác Nhận';
      else if (s === 'occupied') bookingStatus = 'Đã Check-in';
      else if (s === 'cleaning') bookingStatus = 'Đã Check-out';

      if (bookingStatus) {
        db.query(
          `UPDATE Bookings SET status = ?
           WHERE room_id = ?
           ORDER BY id DESC
           LIMIT 1`,
          [bookingStatus, id],
          (err2) => { if (err2) console.log(err2); }
        );
      }

      res.json({
        success: true,
        message: "Cập nhật phòng thành công",
      });
    }
  );
};

// =======================
// DELETE ROOM
// =======================
exports.deleteRoom = (req, res) => {
  const id = req.params.id;

  db.query(
    `DELETE FROM Rooms WHERE id = ?`,
    [id],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }
      res.json({
        success: true,
        message: "Xoá phòng thành công",
      });
    }
  );
};
