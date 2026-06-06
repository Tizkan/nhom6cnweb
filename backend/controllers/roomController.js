const db = require("../config/db");

// =======================
// GET ALL ROOMS
// =======================
exports.getRooms = (req, res) => {
  db.query(
    `
    SELECT
      id,
      room_number,
      room_type_id,
      floor_number,
      status
    FROM Rooms
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
    `
    INSERT INTO Rooms (room_number, room_type_id, floor_number, status)
    VALUES (?, ?, ?, ?)
    `,
    [room_number, room_type_id, floor_number, status],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json({
        success: true,
        message: "Thêm phòng thành công",
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
    `
    UPDATE Rooms
    SET
      room_number = ?,
      room_type_id = ?,
      floor_number = ?,
      status = ?
    WHERE id = ?
    `,
    [room_number, room_type_id, floor_number, status, id],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
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
    `
    DELETE FROM Rooms
    WHERE id = ?
    `,
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