const db = require("../config/db");

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Thiếu email hoặc mật khẩu",
    });
  }

  db.query(
    "SELECT id, full_name, email, password FROM users WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.log(err);

        return res.status(500).json({
          message: "Lỗi server",
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          message: "Email không tồn tại",
        });
      }

      const user = results[0];

      if (user.password !== password) {
        return res.status(401).json({
          message: "Sai mật khẩu",
        });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
        },
      });
    },
  );
};
