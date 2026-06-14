const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "171005", // Đã cập nhật mật khẩu mới của bạn ở đây
  database: "hotelmanager",
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error("MySQL Connection Error:", err);
  } else {
    console.log("MySQL Connected Successfully!");
  }
});

module.exports = db;

