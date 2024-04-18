require('dotenv').config();
const Payment = require('./model');
const Booking = require('../booking/model');
const { CheckoutAPI, Client } = require('@adyen/api-library');

const client = new Client({apiKey: process.env.ADYEN_API, environment: "TEST"});
const checkoutAPI = new CheckoutAPI(client);

const initiatePayment = async (value, type, bookingId) => {

const referenceApi = bookingId;

const paymentRequest = {
  countryCode: "PH",
  amount: {
    currency: "PHP",
    value: value
  },
  reference: referenceApi,
  paymentMethod: {
    type: type
  },
  returnUrl: `http://localhost:5000/payment/handleShopperRedirect?orderRef=${referenceApi}`,
  merchantAccount: process.env.ADYEN_MERCHANT_ACCOUNT,
}

try {
  const response = await checkoutAPI.PaymentsApi.payments(paymentRequest, { idempotencyKey: paymentRequest.reference });
  const newPayment = new Payment({
    bookingId: referenceApi,
    amount: value,
    status: "PENDING",
    paymentMethod: type,
    createdAt: new Date(),
    expiresAfter: new Date(Date.now() + 15 * 60000)
  });

  const createdPayment = await newPayment.save();
  return {
    status: "SUCCESS",
    message: "Payment initiated successfully",
    data: response,
    payment: createdPayment
  }
} catch (error) {
  console.error("Adyen payment error:", error);
}
}


async function consumeEvent(notification) {

  try {
    if (notification.success === "true") {
     
      await Payment.findOneAndDelete({ bookingId: notification.merchantReference });
      await Booking.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(notification.merchantReference) },
        { 
          status: "PENDING"
        }
      );
    } else {  
      await Payment.findOneAndDelete({ bookingId: notification.merchantReference });
      await Booking.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(notification.merchantReference) }, 
        { 
          status: "FAILED" 
        }
      );
    }
  } catch (error) {
    console.error(error);
  }
  
}

module.exports = { initiatePayment, consumeEvent };