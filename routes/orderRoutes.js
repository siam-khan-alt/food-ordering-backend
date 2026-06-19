const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getAllOrders, updateOrderStatus, getSingleOrder } = require('../controllers/orderController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/create', verifyToken, createOrder);
router.get('/myOrder', verifyToken, getMyOrders);
router.get('/allOrder', verifyToken, isAdmin, getAllOrders);
router.patch('/status/:orderId', verifyToken, isAdmin, updateOrderStatus);
router.get('/single/:orderId', verifyToken, getSingleOrder);

module.exports = router;