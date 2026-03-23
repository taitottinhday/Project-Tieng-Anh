const express = require('express');
const router = express.Router();
const placementController = require('../controllers/placementController');

router.get('/placement-tests', placementController.listTests);
router.get('/placement-tests/:id', placementController.showTest);
router.get('/placement-tests/:id/take', placementController.takeTest);
router.post('/placement-tests/:id/submit', placementController.submitTest);
router.get('/placement-tests/result/:attemptId', placementController.showResult);

module.exports = router;
