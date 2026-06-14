const db = require("../config/db");

exports.getOverview = (req, res) => {

  const sql = `
    SELECT
      (SELECT COUNT(*) FROM customers) AS totalCustomers,
      (SELECT COUNT(*) FROM rooms) AS totalRooms,
      (SELECT COUNT(*) FROM bookings) AS totalBookings,
      (SELECT COALESCE(SUM(total_amount),0) FROM bookings) AS totalRevenue
  `;

  db.query(sql, (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).json({
        message: "Lỗi SQL"
      });
    }

    res.json(result[0]);
  });

};