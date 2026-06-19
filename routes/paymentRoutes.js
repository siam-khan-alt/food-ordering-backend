const express = require('express');
const { generateHash } = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/authMiddleware');
const router=express.Router()

router.post('/generate-hash', verifyToken,generateHash);

module.exports = router;