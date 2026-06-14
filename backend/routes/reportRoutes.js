const express = require("express");
const router = express.Router();

const reportController = require("../controllers/reportController");

router.get("/overview", reportController.getOverview);

module.exports = router;