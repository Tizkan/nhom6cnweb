const db = require("../config/db");


// =======================
// TỔNG QUAN BÁO CÁO
// =======================
exports.getOverview = (req, res) => {

  const sql = `
    SELECT

    (SELECT COUNT(*) FROM customers) AS totalCustomers,

    (SELECT COUNT(*) FROM rooms) AS totalRooms,

    (SELECT COUNT(*) 
     FROM rooms 
     WHERE status = 'occupied') AS occupiedRooms,

    (SELECT COUNT(*) FROM bookings) AS totalBookings,

    (SELECT 
        COALESCE(SUM(total_amount),0)
     FROM bookings
     WHERE status IN 
     ('Đã xác nhận','Đã Check-in','Đang ở')
    ) AS totalRevenue

  `;


  db.query(sql, (err, result)=>{

    if(err){
      console.log(err);

      return res.status(500).json({
        message:"Lỗi lấy báo cáo"
      });
    }


    res.json(result[0]);

  });

};




// =======================
// DOANH THU THEO THÁNG
// =======================
exports.getRevenueByMonth = (req,res)=>{


  const sql = `

    SELECT

    MONTH(created_at) AS month,

    SUM(total_amount) AS revenue


    FROM bookings


    WHERE status IN
    (
      'Đã xác nhận',
      'Đã Check-in',
      'Đang ở'
    )


    GROUP BY MONTH(created_at)


    ORDER BY month ASC

  `;



  db.query(sql,(err,result)=>{


    if(err){

      console.log(err);

      return res.status(500).json(err);

    }


    res.json(result);


  });



};





// =======================
// THỐNG KÊ TRẠNG THÁI PHÒNG
// =======================
exports.getRoomStatus = (req,res)=>{


  const sql = `

    SELECT

    status,

    COUNT(*) AS quantity


    FROM rooms


    GROUP BY status

  `;



  db.query(sql,(err,result)=>{


    if(err){

      return res.status(500).json(err);

    }


    res.json(result);


  });



};





// =======================
// TOP KHÁCH HÀNG CHI TIÊU
// =======================
exports.getTopCustomers = (req,res)=>{


  const sql = `


    SELECT


    c.full_name,


    COUNT(b.id) AS totalBooking,


    SUM(b.total_amount) AS totalSpent



    FROM customers c


    JOIN bookings b

    ON c.id = b.customer_id



    WHERE b.status IN
    (
      'Đã xác nhận',
      'Đã Check-in',
      'Đang ở'
    )



    GROUP BY c.id



    ORDER BY totalSpent DESC


    LIMIT 10


  `;



  db.query(sql,(err,result)=>{


    if(err){

      return res.status(500).json(err);

    }


    res.json(result);


  });



};





// =======================
// BOOKING THEO TRẠNG THÁI
// =======================
exports.getBookingStatus = (req,res)=>{


  const sql = `


    SELECT


    status,


    COUNT(*) AS quantity



    FROM bookings



    GROUP BY status


  `;



  db.query(sql,(err,result)=>{


    if(err){

      return res.status(500).json(err);

    }


    res.json(result);


  });



};