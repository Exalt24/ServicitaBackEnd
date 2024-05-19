// To Access MongoDB
const FirebaseService = require('./config/firebase');
const { Expo } = require('expo-server-sdk');
const { CronJob } = require('cron');

require('./config/db');

const app = require('express')();
const bodyParser = require('express').json;


const routes = require('./routes');
const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,
   optionSuccessStatus:200,
}

app.use(cors(corsOptions))
// const CustomError = require('./util/CustomError');
// const globalErrorHandler = require('./domains/errorController');

// Accepting Post Form Data
app.use(bodyParser());
const expo = new Expo();

// new CronJob('*/30 * * * * *', async () => {
//    const users = await FirebaseService.getAllUsers();
    
//       for (const user of users) {
//          for (const token of user.expoTokens) {
//          const message = {
//             to: token,
//             sound: 'default',
//             title: 'Servicita',
//             body: 'Hello! How can we help you today?',
//          };
//          let chunks = expo.chunkPushNotifications([message]);
//          let tickets = [];
//          (async () => {
//             for (let chunk of chunks) {
//                try {
//                   let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
//                   tickets.push(...ticketChunk);
//                } catch (error) {
//                   console.error(error);
//                }
//             }
//          })();

//          let receiptIds = [];
//          for (let ticket of tickets) {
//             if (ticket.id) {
//                receiptIds.push(ticket.id);
//             }
//          }

//          let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
//          (async () => {
//             for (let chunk of receiptIdChunks) {
//                try {
//                   let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
//                   console.log(receipts);

//                   for (let receiptId in receipts) {
//                      let { status, details } = receipts[receiptId];
//                      if (status === 'ok') {
//                         continue;
//                      } else if (status === 'error') {
//                         console.error(`There was an error sending a notification: ${details.error}`);
//                      }
//                   }
//                } catch (error) {
//                   console.error(error);
//                }
//             }
//          })(); 
//       }
//    }

// } , null, true, 'Asia/Manila');

// Registering Routes
app.use(routes);
// Error Handling
// app.all('*', (req, res, next) => {
//     const err = new CustomError(`Can't find ${req.originalUrl} on this server!`, 404);
//     next(err);
// });
// app.use(globalErrorHandler);



module.exports = app;