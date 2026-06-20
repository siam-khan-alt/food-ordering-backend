const crypto = require('crypto');
const Order = require('../models/Order');

const generateHash = (req, res) => {
  const { orderId, amount, currency = 'LKR' } = req.body;

  const merchantId = process.env.PAYHERE_MERCHANT_ID;
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

  const hashedSecret = crypto
    .createHash('md5')
    .update(merchantSecret)
    .digest('hex')
    .toUpperCase();

  const amountFormatted = parseFloat(amount).toFixed(2);

  const hash = crypto
    .createHash('md5')
    .update(
      merchantId +
      orderId +
      amountFormatted +
      currency +
      hashedSecret
    )
    .digest('hex')
    .toUpperCase();

  res.status(200).send({
    merchantId,
    hash,
    orderId,
    amount: amountFormatted,
    currency
  });
};

const paymentNotify = async (req, res) => {
  try {
    const {
      order_id,
      payhere_amount,
      status_code,
      md5sig
    } = req.body;

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    const hashedSecret = crypto
      .createHash('md5')
      .update(merchantSecret)
      .digest('hex')
      .toUpperCase();

    const localMd5sig = crypto
      .createHash('md5')
      .update(
        merchantId +
        order_id +
        payhere_amount +
        req.body.payhere_currency +
        status_code +
        hashedSecret
      )
      .digest('hex')
      .toUpperCase();

    if (localMd5sig !== md5sig) {
      return res.status(400).send({ message: "Invalid signature" });
    }

    if (status_code === '2') {
      await Order.findByIdAndUpdate(order_id, { paymentStatus: 'paid' });
    } else if (status_code === '-1' || status_code === '-2') {
      await Order.findByIdAndUpdate(order_id, { paymentStatus: 'failed' });
    }

    res.status(200).send('OK');
  } catch (error) {
    res.status(500).send({ message: "Notify failed" });
  }
};


module.exports = { generateHash, paymentNotify };