"use strict";

const paymongo = require('paymongo-node')(process.env.PAYMONGO_SECRET)

const initiatePayment = async (type, amount, redirect) => {
  try {
    const resource = await paymongo.sources.create({
      amount: amount * 100,
      currency: 'PHP',
      type: type,
      redirect: {
        success: redirect.success,
        failed: redirect.failed
      },
    });
    return resource;
  } catch (e) {
    if (e.type === "AuthenticationError") {
      console.log("auth error");
      throw new Error("AuthenticationError");
    } else if (e.type === "RouteNotFoundError") {
      console.log("route not found");
      throw new Error("RouteNotFoundError");
    } else if (e.type === "InvalidRequestError") {
      console.log(e.errors);
      throw new Error("InvalidRequestError");
    }
  }
  }
  
  const retrievePayment = async (id) => {
    try {
      const payment = await paymongo.sources.retrieve(id);
      return payment;
    } catch (e) {
      if (e.type === "AuthenticationError") {
        console.log("auth error");
        throw new Error("AuthenticationError");
      } else if (e.type === "ResourceNotFoundError") {
        console.log(e.errors);
        throw new Error("ResourceNotFoundError");
      } else if (e.type === "RouteNotFoundError") {
        console.log("route not found");
        throw new Error("RouteNotFoundError");
      } else if (e.type === "InvalidRequestError") {
        console.log(e.errors);
        throw new Error("InvalidRequestError");
      }
    }
  }

module.exports = { initiatePayment, retrievePayment};
  