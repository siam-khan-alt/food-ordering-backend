const FoodItem = require('../models/FoodItem');

const addFoodItem = async (req, res) => {
  try {
    const { name, category, price, image } = req.body;

    const newFood = new FoodItem({ name, category, price, image });
    await newFood.save();

    res.status(201).send({ message: "Food item added", food: newFood });
  } catch (error) {
    res.status(500).send({ message: "Failed to add food", error: error.message });
  }
};

const getAllFoodItems = async (req, res) => {
  try {
    const foods = await FoodItem.find({ available: true });
    res.status(200).send(foods);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch food items" });
  }
};

module.exports = { addFoodItem, getAllFoodItems };