const express = require('express');
const router = express.Router();

// This line imports BOTH functions from your controller file.
const { generateAutomatedReport, getReportStatus } = require('../controllers/automationController');

// This route starts the automation.
// It uses the 'generateAutomatedReport' function.
router.post('/generate-report', generateAutomatedReport);

// This route allows the frontend to check for the finished report.
// It uses the 'getReportStatus' function.
router.get('/report/:projectId', getReportStatus);

module.exports = router;