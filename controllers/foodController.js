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

const updateFoodItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFood = await FoodItem.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedFood) {
      return res.status(404).send({ message: "Food item not found" });
    }

    res.status(200).send({ message: "Food item updated", food: updatedFood });
  } catch (error) {
    res.status(500).send({ message: "Failed to update food item" });
  }
};

const deleteFoodItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFood = await FoodItem.findByIdAndDelete(id);

    if (!deletedFood) {
      return res.status(404).send({ message: "Food item not found" });
    }

    res.status(200).send({ message: "Food item deleted" });
  } catch (error) {
    res.status(500).send({ message: "Failed to delete food item" });
  }
};


module.exports = { addFoodItem, getAllFoodItems, updateFoodItem, deleteFoodItem };