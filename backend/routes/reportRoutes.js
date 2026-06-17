const express = require('express');

const router = express.Router();

const reportController =
    require('../controllers/reportController');

router.get(
    '/dashboard',
    reportController.getDashboardReport
);

module.exports = router;