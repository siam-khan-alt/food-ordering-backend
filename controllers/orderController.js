const Order = require('../models/Order');
const FoodItem = require('../models/FoodItem');

const createOrder = async (req, res) => {
  try {
    const { items } = req.body;
    const customerId = req.user.userId;

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const food = await FoodItem.findById(item.foodItemId);
      if (!food) {
        return res.status(404).send({ message: `Food item not found: ${item.foodItemId}` });
      }

      orderItems.push({
        foodItem: food._id,
        quantity: item.quantity,
        price: food.price
      });

      totalAmount += food.price * item.quantity;
    }

    const newOrder = new Order({
      customer: customerId,
      items: orderItems,
      totalAmount
    });

    await newOrder.save();

    res.status(201).send({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    res.status(500).send({ message: "Failed to create order", error: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const orders = await Order.find({ customer: customerId })
      .populate('items.foodItem', 'name price');

    res.status(200).send(orders);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch orders" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email')
      .populate('items.foodItem', 'name price');

    res.status(200).send(orders);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch all orders" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).send({ message: "Order not found" });
    }

    res.status(200).send({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).send({ message: "Failed to update order status" });
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus };