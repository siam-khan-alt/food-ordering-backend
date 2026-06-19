const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getAllOrders } = require('../controllers/orderController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/create', verifyToken, createOrder);
router.get('/myOrder', verifyToken, getMyOrders);
router.get('/allOrder', verifyToken, isAdmin, getAllOrders);
router.patch('/status/:orderId', verifyToken, isAdmin, updateOrderStatus);
module.exports = router;