const crypto = require('crypto');

const generateHash = (req, res) => {
  const { orderId, amount } = req.body;

  const merchantId = process.env.PAYHERE_MERCHANT_ID;
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

  const hashedSecret = crypto
    .createHash('md5')
    .update(merchantSecret)
    .digest('hex')
    .toUpperCase();

  const amountFormatted = parseFloat(amount).toLocaleString('en-us', {
    minimumFractionDigits: 2
  }).replaceAll(',', '');

  const hash = crypto
    .createHash('md5')
    .update(
      merchantId +
      orderId +
      amountFormatted +
      'LKR' +
      hashedSecret
    )
    .digest('hex')
    .toUpperCase();

  res.status(200).send({
    merchantId,
    hash,
    orderId,
    amount: amountFormatted
  });
};

module.exports = { generateHash };