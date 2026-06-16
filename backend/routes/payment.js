const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const qs = require("qs");
const db = require("../config/db");

//Sort theo alphabet — VNPay yêu cầu các tham số 
//phải được sắp xếp theo thứ tự chữ cái trước khi ký.
function buildQuery(obj) {
  return Object.keys(obj)
    .sort()
    .map((k) => `${k}=${encodeURIComponent(obj[k])}`)
    .join("&");
}

//Tạo chữ ký số HMAC-SHA512. Dùng VNPAY_HASH_SECRET làm khóa.
function hmacSHA512(data, secret) {
  return crypto.createHmac("sha512", secret).update(data, "utf8").digest("hex");
}

function getIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress ||
    "127.0.0.1"
  ).replace("::1", "127.0.0.1");
}

// ================= CREATE =================
router.post("/create", (req, res) => {
  try {
    const { amount, bookingIds = [] } = req.body;

    const date = new Date();
    const pad = (n) => String(n).padStart(2, "0");

    const createDate =
      `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
      `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;

        //txnRef mã hóa cả timestamp 
        //+ danh sách booking ID để sau khi VNPay return về có thể trích xuất ra.
    const txnRef = `${Date.now()}__${bookingIds.join("-")}`;

    let vnpParams = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: process.env.VNPAY_TMN_CODE,
      vnp_Amount: Math.round(Number(amount) * 100),//1nvđ = 100 vì không nhận thập phân trong sql
      vnp_CurrCode: "VND",
      vnp_TxnRef: `${Date.now()}__${bookingIds.join("-")}`,
      vnp_OrderInfo: "test",
      vnp_OrderType: "other",
      vnp_Locale: "vn",
      vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
      vnp_IpAddr: getIp(req),
      vnp_CreateDate: createDate,
    };
    const signData = buildQuery(vnpParams);

    const secureHash = hmacSHA512(signData, process.env.VNPAY_HASH_SECRET);

    vnpParams.vnp_SecureHash = secureHash;
    const paymentUrl = process.env.VNPAY_URL + "?" + buildQuery(vnpParams);

    return res.json({ paymentUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// ================= RETURN =================
router.get("/vnpay-return", (req, res) => { //Nhận kết quả từ VNPay
  try {
    // 1. Lấy hash từ VNPay gửi về
    const secureHash = req.query.vnp_SecureHash;

    let vnpParams = { ...req.query };
    // 2. Xóa hash khỏi params
    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;

    const signData = buildQuery(vnpParams);
    // 3. Tự tính lại hash
    const expectedHash = hmacSHA512(signData, process.env.VNPAY_HASH_SECRET);

    // 4. So sánh — nếu khác nhau → dữ liệu bị giả mạo
    if (expectedHash !== secureHash) {
      return res.redirect(
        "http://localhost:4200/bookings?payment=fail&reason=invalid_signature",
      );
    }

    const responseCode = req.query.vnp_ResponseCode;
    
    // 5. Kiểm tra mã phản hồi
    if (responseCode !== "00") {// "00" = thành công

      return res.redirect(
        `http://localhost:4200/bookings?payment=fail&code=${responseCode}`,
      );
    }

    // Lấy bookingIds từ TxnRef: "timestamp__1-2-3"
    const txnRef = req.query.vnp_TxnRef || "";
    // 6. Giải mã bookingIds từ txnRef bỏ __
    const parts = txnRef.split("__");//["timestamp", "1-2-3"]
    const bookingIds = parts[1]
      ? parts[1].split("-").map(Number).filter(Boolean)
      : [];

    if (!bookingIds.length) {
      return res.redirect("http://localhost:4200/bookings?payment=success");
    }

    // Cập nhật DB
    const placeholders = bookingIds.map(() => "?").join(",");
    db.query(
      `UPDATE Bookings SET status = 'Đã xác nhận' WHERE id IN (${placeholders})`,
      bookingIds,
      (err) => {
        if (err) {
          console.error("DB Error:", err);
          return res.redirect(
            "http://localhost:4200/bookings?payment=success&db=error",
          );
        }
        // Thành công → redirect về Angular kèm ids để hiện thông báo
        return res.redirect(
          `http://localhost:4200/bookings?payment=success&ids=${bookingIds.join(",")}`,
        );
      },
    );
  } catch (err) {
    console.error(err);
    return res.redirect("http://localhost:4200/bookings?payment=fail");
  }
});

module.exports = router;
