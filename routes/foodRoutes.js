const express = require('express');
const router = express.Router();
const { addFoodItem, getAllFoodItems, updateFoodItem, deleteFoodItem } = require('../controllers/foodController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/add', verifyToken, isAdmin, addFoodItem);
router.get('/all', getAllFoodItems);
router.patch('/update/:id', verifyToken, isAdmin, updateFoodItem);
router.delete('/delete/:id', verifyToken, isAdmin, deleteFoodItem);

module.exports = router;