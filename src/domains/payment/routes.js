const express = require('express');
const router = express.Router();
const { hmacValidator } = require('@adyen/api-library');
const { CheckoutAPI, Client } = require('@adyen/api-library');
const { initiatePayment, consumeEvent } = require('./controller');


const client = new Client({apiKey: process.env.ADYEN_API, environment: "TEST"});
const checkoutAPI = new CheckoutAPI(client);

router.post('/initiatePayment', async (req, res) => {
  const { value, type, bookingId } = req.body;
  try {
    const response = await initiatePayment(value, type, bookingId);
    res.json(response);
  }
  catch (error) {
    res.status(400).json({
      status: "FAILED",
      message: error.message
    });
  }
})

router.all('/handleShopperRedirect', async (req, res) => {
  const redirect = req.method === "GET" ? req.query : req.body;
  const details = {};
  if (redirect.redirectResult) {
    details.redirectResult = redirect.redirectResult;
    console.log(redirect.redirectResult);
  } else if (redirect.payload) {
    details.payload = redirect.payload;
    console.log(redirect.payload);
  }
    
    try {
      const response = await checkoutAPI.PaymentsApi.paymentsDetails({ details });
      switch (response.resultCode) {
        case "Authorised":
          res.send("Payment successful");
          break;
        case "Pending":
        case "Received":
          res.send("Payment pending");
          break;
        case "Refused":
          res.send("Payment refused");
          break;
        default:
          res.send("Payment failed");
          break;
      }
    } catch (err) {
      console.error(`Error: ${err.message}, error code: ${err.errorCode}`);
      res.send("Internal Server Error");
    }
  })

  router.post("/submitAdditionalDetails", async (req, res) => {
    const payload = {
      details: req.body.details,
      paymentData: req.body.paymentData,
    };
  
    try {
      const response = await checkoutAPI.PaymentsApi.paymentsDetails(payload);
  
      res.json(response);
    } catch (err) {
      console.error(`Error: ${err.message}, error code: ${err.errorCode}`);
      res.status(err.statusCode).json(err.message);
    }
  });

  router.post('/webhook', async (req, res) => {
  
  const hmacKey = process.env.ADYEN_HMAC_KEY;
  console.log(hmacKey)
  const validator = new hmacValidator()

  const notificationRequest = req.body;
  const notificationRequestItems = notificationRequest.notificationItems


  const notification = notificationRequestItems[0].NotificationRequestItem
  console.log(notification)

  if(validator.validateHMAC(notification, hmacKey) ) {

    const merchantReference = notification.merchantReference;
    const eventCode = notification.eventCode;
    console.log("merchantReference:" + merchantReference + " eventCode:" + eventCode);

    consumeEvent(notification);

    res.status(202).send(notification);

  } else {
    console.log("Invalid HMAC signature: " + notification);
    res.status(401).send('Invalid HMAC signature');
  }
});



module.exports = router;
