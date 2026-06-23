const crypto = require('crypto');
const Order = require('../models/Order');

const formatPayHereAmount = (amount) => Number.parseFloat(amount).toFixed(2);

const hashMerchantSecret = (merchantSecret) =>
  crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();

// Official formula:
// uppercase(md5(merchant_id + order_id + amount + currency + uppercase(md5(merchant_secret))))
const generatePaymentHash = ({ merchantId, orderId, amount, currency, merchantSecret }) => {
  const amountFormatted = formatPayHereAmount(amount);
  const currencyUpper = String(currency).toUpperCase();
  const hashedSecret = hashMerchantSecret(merchantSecret);

  return crypto
    .createHash('md5')
    .update(merchantId + orderId + amountFormatted + currencyUpper + hashedSecret)
    .digest('hex')
    .toUpperCase();
};

// Official notify verification:
// uppercase(md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + uppercase(md5(merchant_secret))))
const verifyNotifySignature = ({
  merchantId,
  orderId,
  payhereAmount,
  payhereCurrency,
  statusCode,
  merchantSecret,
  md5sig,
}) => {
  const hashedSecret = hashMerchantSecret(merchantSecret);
  const localMd5sig = crypto
    .createHash('md5')
    .update(
      merchantId +
        String(orderId) +
        String(payhereAmount) +
        String(payhereCurrency).toUpperCase() +
        String(statusCode) +
        hashedSecret
    )
    .digest('hex')
    .toUpperCase();

  return localMd5sig === md5sig;
};

const generateHash = (req, res) => {
  const { orderId, amount, currency = 'LKR' } = req.body;

  if (!orderId || amount == null || Number.isNaN(Number.parseFloat(amount))) {
    return res.status(400).send({ message: 'Valid orderId and amount are required' });
  }

  const merchantId = String(process.env.PAYHERE_MERCHANT_ID || '').trim();
  const merchantSecret = String(process.env.PAYHERE_MERCHANT_SECRET || '').trim();

  if (!merchantId || !merchantSecret) {
    return res.status(500).send({ message: 'PayHere credentials are not configured' });
  }

  const orderIdStr = String(orderId);
  const amountFormatted = formatPayHereAmount(amount);
  const currencyUpper = String(currency).toUpperCase();
  const hash = generatePaymentHash({
    merchantId,
    orderId: orderIdStr,
    amount: amountFormatted,
    currency: currencyUpper,
    merchantSecret,
  });

  res.status(200).send({
    merchantId,
    hash,
    orderId: orderIdStr,
    amount: amountFormatted,
    currency: currencyUpper,
  });
};

const paymentNotify = async (req, res) => {
  try {
    const { order_id, payhere_amount, payhere_currency, status_code, md5sig } = req.body;

    const merchantId = String(process.env.PAYHERE_MERCHANT_ID || '').trim();
    const merchantSecret = String(process.env.PAYHERE_MERCHANT_SECRET || '').trim();

    const isValid = verifyNotifySignature({
      merchantId,
      orderId: order_id,
      payhereAmount: payhere_amount,
      payhereCurrency: payhere_currency,
      statusCode: status_code,
      merchantSecret,
      md5sig,
    });

    if (!isValid) {
      return res.status(400).send({ message: 'Invalid signature' });
    }

    if (status_code === '2') {
      await Order.findByIdAndUpdate(order_id, { paymentStatus: 'paid' });
    } else if (status_code === '-1' || status_code === '-2') {
      await Order.findByIdAndUpdate(order_id, { paymentStatus: 'failed' });
    }

    res.status(200).send('OK');
  } catch (error) {
    res.status(500).send({ message: 'Notify failed' });
  }
};

module.exports = { generateHash, paymentNotify };
