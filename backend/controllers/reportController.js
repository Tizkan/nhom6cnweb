const db = require("../config/db");

exports.getDashboardReport = async (req, res) => {
  try {
    const validStatuses = ["Đã Xác Nhận", "Đã Check-in", "Đã Check-out"];

    // =========================
    // 1. DOANH THU THÁNG
    // =========================
    const [monthlyRevenueRows] = await db.promise().query(
      `
SELECT 
    total_amount
FROM bookings
WHERE check_in >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
AND check_in <= LAST_DAY(CURDATE())
AND TRIM(status) IN (?)
`,
      [validStatuses],
    );

    const monthlyRevenue = monthlyRevenueRows.reduce(
      (sum, b) => sum + Number(b.total_amount || 0),
      0,
    );

    // =========================
    // =========================
    // 2. TỶ LỆ LẤP ĐẦY THÁNG HIỆN TẠI
    // Chỉ lấy booking bắt đầu từ ngày đầu tháng
    // đến ngày cuối tháng
    // =========================

    const [occupiedRooms] = await db.promise().query(
      `
SELECT COUNT(DISTINCT room_id) AS total
FROM bookings
WHERE TRIM(status) IN (?)
AND check_in >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
AND check_in <= LAST_DAY(CURDATE())
`,
      [validStatuses],
    );

    const [allRooms] = await db.promise().query(`
SELECT COUNT(*) AS total 
FROM rooms
`);

    const occupancy =
      allRooms[0].total === 0
        ? 0
        : Math.round((occupiedRooms[0].total / allRooms[0].total) * 100);

    // =========================
    // 3. THỜI GIAN LƯU TRÚ TB
    // =========================
    const [stayRows] = await db.promise().query(
  `
  SELECT check_in, check_out
  FROM bookings
  WHERE MONTH(check_in) = MONTH(CURDATE())
    AND YEAR(check_in) = YEAR(CURDATE())
    AND TRIM(status) IN (?)
  `,
  [validStatuses],
);

console.log("=== stayRows tháng này ===", stayRows);

const totalDays = stayRows.reduce((sum, b) => {
  if (!b.check_in || !b.check_out) return sum;
  const diff =
    (new Date(b.check_out) - new Date(b.check_in)) / (1000 * 60 * 60 * 24);
  return sum + diff;
}, 0);

const avgDays =
  stayRows.length > 0 ? (totalDays / stayRows.length).toFixed(1) : 0;

    // =========================
    // 4. BIỂU ĐỒ DOANH THU (FIXED 100%)
    // =========================
    const [revenueChart] = await db.promise().query(
      `
      SELECT 
        YEAR(created_at) AS year,
        MONTH(created_at) AS month_num,
        ROUND(SUM(total_amount) / 1000000, 0) AS revenue,
        COUNT(*) AS bookings
      FROM bookings
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        AND status IN (?)
      GROUP BY year, month_num
      ORDER BY year, month_num
      `,
      [validStatuses],
    );

    // 👉 format month ở JS (TRÁNH LỖI SQL MODE)
    const formattedRevenueChart = revenueChart.map((item) => ({
      year: item.year,
      month_num: item.month_num,
      month: `T${item.month_num}`,
      revenue: item.revenue,
      bookings: item.bookings,
    }));

    // =========================
    // 5. TOP 5 VIP KHÁCH HÀNG
    // =========================
    const [vipCustomers] = await db.promise().query(
      `
      SELECT 
        c.full_name AS name,
        COUNT(b.id) AS bookingsCount,
        SUM(b.total_amount) AS totalSpent
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      WHERE b.status IN (?)
      GROUP BY c.id, c.full_name
      ORDER BY totalSpent DESC
      LIMIT 5
      `,
      [validStatuses],
    );

    vipCustomers.forEach((c, i) => (c.rank = i + 1));

    // =========================
    // 6. PHÂN BỐ LOẠI PHÒNG
    // =========================
    const [roomDistribution] = await db.promise().query(`
      SELECT 
        rt.name AS type,
        ROUND(COUNT(*) * 100 / (SELECT COUNT(*) FROM rooms), 0) AS percentage
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.id
      GROUP BY rt.id, rt.name
    `);

    // =========================
    // RESPONSE
    // =========================
    res.json({
      success: true,
      data: {
        kpis: {
          monthlyRevenue: {
            displayValue: "đ" + Math.round(monthlyRevenue / 1000000) + "M",
            growth: "+0%",
          },
          occupancyRate: {
            displayValue: occupancy + "%",
            growth: "+0%",
          },
          averageStayDuration: {
            displayValue: avgDays + " đêm",
            growth: "+0%",
          },
        },
        revenueChart: formattedRevenueChart,
        roomDistribution,
        vipCustomers,
      },
    });
  } catch (error) {
    console.error("Dashboard Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi lấy dữ liệu dashboard",
      error: error.message,
    });
  }
};
