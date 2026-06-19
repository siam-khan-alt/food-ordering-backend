const express = require('express');
const { generateHash, paymentNotify } = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/authMiddleware');
const router=express.Router()

router.post('/generate-hash', verifyToken,generateHash);
router.post('/notify', paymentNotify);

module.exports = router;