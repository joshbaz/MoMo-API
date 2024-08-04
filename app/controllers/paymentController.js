import mongoose from 'mongoose';
import payModel from '../models/payModel.js';
import axios from 'axios';
import dotenv from "dotenv";
import momo from "mtn-momo";

dotenv.config();

const { Collections } = momo.create({
  callbackHost: process.env.CALLBACK_HOST,
});

export const makePaymentRequest = async (req, res, next) => {
  try {
    let accessTk = req.access_token;
    let primaryKey = process.env.MoMo_Collect_Primary;
    const requestPayLink = ` ${process.env.MoMo_BASEURL}/collection/v1_0/requesttopay`;
    
    //get api key & api credentials registered

    const checkApiUser = await payModel.findOne();

    if (!checkApiUser) {
      const error = new Error("Something went wrong");
      error.statusCode = 404;
      throw error;
    }

    let xReferenceId = checkApiUser.xReferenceId; //must be unique
    let Bearertk = `Bearer ${accessTk}`;

      const requestPay = await axios.post(
        requestPayLink,
        {
          amount: "5.0",
          currency: "EUR",
          externalId: "123DVF", //transact-number
          payer: {
            partyIdType: "MSISDN",
            partyId: "00758483457",
          },
          payerMessage: "Subscrbe for Nyati-fate",
          payeeNote: "payer note",
        },
        {
          headers: {
            Authorization: Bearertk,
          //  "X-Callback-Url": "localhost:8000",
            "X-Reference-Id": xReferenceId,
            "X-Target-Environment": "sandbox",
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": primaryKey,
          },
        }
    );
    
    console.log("requestPay", requestPay);


    
 //console.log('req', req.apiUserKey, req.access_token)
    res.status(200).json("Payment Initiated");
    } catch (error) {
         if (!error.statusCode) {
           error.statusCode = 500;
         }
         next(error);
    }
}

//version with MoMo module

export const makePaymentSandBox = async (req, res, next) => {
  try {
    const collections = Collections({
      userSecret: process.env.MoMouserSecret,
      userId: process.env.MoMouserId,
      primaryKey: process.env.MoMo_Collect_Primary,
    });

    collections
      .requestToPay({
        amount: "50",
        currency: "EUR",
        externalId: "123456",
        payer: {
          partyIdType: "MSISDN",
          partyId: "256774290781",
        },
        payerMessage: "testing",
        payeeNote: "hello",
      })
      .then((transactionId) => {
        console.log({ transactionId });

        // Get transaction status
        return collections.getTransaction(transactionId);
      })
      .then((transaction) => {
        console.log({ transaction });

        // Get account balance
        return collections.getBalance();
      })
      .then((accountBalance) => console.log({ accountBalance }))
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    
  }
}


