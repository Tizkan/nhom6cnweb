const express = require("express");

const router = express.Router();

const reportController = require("../controllers/reportController");



router.get(
"/overview",
reportController.getOverview
);


router.get(
"/revenue",
reportController.getRevenueByMonth
);


router.get(
"/rooms",
reportController.getRoomStatus
);


router.get(
"/customers",
reportController.getTopCustomers
);


router.get(
"/bookings",
reportController.getBookingStatus
);



module.exports = router;