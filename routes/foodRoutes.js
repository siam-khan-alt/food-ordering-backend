const express = require('express');
const router = express.Router();
const { addFoodItem, getAllFoodItems } = require('../controllers/foodController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/add', verifyToken, isAdmin, addFoodItem);
router.get('/all', getAllFoodItems);

module.exports = router;