const express = require('express');
const path = require('path');  
const router = express.Router();
const { initiatePayment, retrievePayment } = require('./controller');
const paymongo = require('paymongo-node')(process.env.PAYMONGO_SECRET)

const htmlDir = path.join(__dirname, '../../pages');

router.post('/initiatePayment', async (req, res) => {
  const { type, amount, redirect } = req.body;
  try {
    const payment = await initiatePayment(type, amount, redirect);
    const checkIfWebhookEnabled = await paymongo.webhooks.retrieve(process.env.PAYMONGO_WEBHOOK_ID);
    if (checkIfWebhookEnabled.status === 'disabled') {
      await paymongo.webhooks.enable(process.env.PAYMONGO_WEBHOOK_ID);
    }
    res.status(200).json({
      status: "SUCCESS",
      message: "Payment initiated",
      data: payment
    });
  }
  catch (error) {
    res.status(400).json({
      status: "FAILED",
      message: error.message
    });
     console.log(error);
  }
})

router.post('/retrievePayment', async (req, res) => {
  const { id } = req.body;
  console.log("id", id);
  try {
    const payment = await retrievePayment(id);
    res.status(200).json({
      status: "SUCCESS",
      message: "Payment details retrieved",
      data: payment
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "FAILED",
      message: error.message
    });
  }
}
)

router.post('/webhook', async (req, res) => {
  const { data } = req.body;
  try {

    
    if (data.attributes.type === 'source.chargeable') {
      const amount = data.attributes.data.attributes.amount;
      const id = data.attributes.data.id;

      const payload = {
        amount: amount,
        currency: "PHP",
        source: {
          id: id,
          type: "source"
        },
        description: "Source Payment Description"
      };

      const payment = await paymongo.payments.create(payload);

      res.status(200).json({
        status: "SUCCESS",
        message: "Payment created",
        data: payment
      });
    } else {
    }
  } catch (error) {
    console.log('Error processing webhook:', error);
    res.status(400).send('Error processing webhook.');
  }
});

router.get('/success', (req, res) => {
  res.sendFile(path.join(htmlDir, 'success.html'));
});

router.get('/failed', (req, res) => {
  res.sendFile(path.join(htmlDir, 'failed.html'));
});


module.exports = router;