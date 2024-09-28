import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import transactModel from "../models/TransactionModel.js";
import { generateMTNAuthTk } from "../middleware/ProdMMToken.js";
import { v4 as uuidv4 } from "uuid";
import axios from 'axios';
import multer from "multer";
const router = express.Router();

dotenv.config();

const upload = multer({
    storage: multer.memoryStorage()
})

// request payments
router.post("/donate", upload.none(), generateMTNAuthTk, async (req, res, next) => {
    try {

        console.log("mtn bearerTk", req.mtn_access_token);

        const createdUUID = uuidv4();

        if (req.body.paymentType === "MTN") {
            let TargetEnv = process.env.Production_State === "production" ? process.env.TargetEnvProd : process.env.TargetEnvSandBox;

            let subscription_Key = process.env.Production_State === "production" ? process.env.MoMo_Prod_Collect_Primary : process.env.MoMo_Collect_Primary;

            let MTN_BaseUrl = process.env.Production_State === "production" ? process.env.MoMo_Prod_BASEURL : process.env.MoMo_SandboxURL;

            let MTNRequestLink = `${MTN_BaseUrl}/collection/v1_0/requesttopay`


            const createTransaction = new transactModel({
                _id: new mongoose.Types.ObjectId(),
                transactionType: "donation",
                paymentType: "MTN-MoMo",
                amount: req.body.amount,
                purpose: req.body.note,
                currency: "UGX",
                email: req.body.email,
                phonenumber: req.body.phonenumber,
                fistname: req.body.firstname,
                lastname: req.body.lastname,
                orderTrackingId: createdUUID,
                payment_status_description: "Pending"
            });

            let savedTransaction = await createTransaction.save();

            {/** declaration of the request and header parameters for axios request */ }

            {/**
            All Statuses Expected & testCases:
            Failed - 46733123450
            Rejected - 46733123451
            Timeout - 46733123452
            Success - 56733123453
            Pending - 46733123454
            
            */}
            let requestParameters = {
                amount: "1.0",
                "currency": "EUR",
                externalId: savedTransaction._id, // can be orderId(payrequest Id) or transac-Id
                payer: {
                    partyIdType: "MSISDN",
                    partyId: "00758483457", //phonenumber
                },
                payerMessage: "Donation of amount / Monthly Subscription for Nyati", //Reason for Payment
                payeeNote: ""
            };

            let headers = {
                "Content-Type": "application/json",
                "Authorization": req.mtn_access_token,
                "X-Callback-Url": `${process.env.MoMo_Callback_BaseURL}/nyatimtn/status/${createdUUID}`,
                "X-Reference-Id": createdUUID,
                "X-Target-Environment": TargetEnv,
                "Ocp-Apim-Subscription-Key": subscription_Key
            }

            let submitOrderRequest = await axios.post(MTNRequestLink, requestParameters, { headers: headers });

            res.status(200).json({
                orderTrackingId: createdUUID
            })

        } else {
            res.status(500).json("Check Payment Selected")
        }
        
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
});

//check status of payment
router.get("/transact_statuses", generateMTNAuthTk, async (req, res, next) => {
    try {

        const { OrderTrackingId } = req.query;

        let getTransact = await transactModel.findOne({ orderTrackingId: OrderTrackingId });

        if (!getTransact) {
            const error = new Error("Transaction not Found");
            error.statusCode = 404;
            throw error;
        }

        let TargetEnv = process.env.Production_State === "production" ? process.env.TargetEnvProd : process.env.TargetEnvSandBox;

        let subscription_Key = process.env.Production_State === "production" ? process.env.MoMo_Prod_Collect_Primary : process.env.MoMo_Collect_Primary;
        
        let MTN_BaseUrl = process.env.Production_State === "production" ? process.env.MoMo_Prod_BASEURL : process.env.MoMo_SandboxURL;

        let MTNRequestLink = `${MTN_BaseUrl}/collection/v1_0/requesttopay/${OrderTrackingId}`;

        let headers = {
            "Content-Type": "application/json",
            "X-Target-Environment": TargetEnv,
            "Ocp-Apim-Subscription-Key": subscription_Key,
            "Authorization": req.mtn_access_token
        }

        let submitStatusRequest = await axios.get(MTNRequestLink, { headers: headers });

        {/**
            All Statuses Expected & testCases:
            Failed 
            Rejected
            Timeout
            Success
            Pending
            
            */}
        console.log("response from MTN", submitStatusRequest.data);
        console.log("transactStatus", submitStatusRequest.data.status);

        const selectMessage = (shortMessage) => {
            let message = shortMessage ? shortMessage.toLowerCase() : shortMessage
            switch (message) {
               
                case "failed":
                    return "Transaction has Failed";
                case "successful":
                    return "Transaction Successful";
                case "pending":
                    return "Transaction Pending";
                case "rejected":
                    return "Transaction Rejected";
                case "timeout":
                    return "Transaction Timedout"
                default:
                    return null;
            }
        }
        let transactStatus = selectMessage(submitStatusRequest.data.status);
       
        //check if transaction status same as the saved one in the db

        if (transactStatus !== getTransact.payment_status_description) {
            getTransact.transactionId = submitStatusRequest.data.financialTransactionId;
            getTransact.payment_status_description = transactStatus;
            getTransact.status_reason = transactStatus;

            let savedStatus = getTransact.save();

            res.status(200).json({
                transactionId: savedStatus.transactionId,
                payStatus: savedStatus.payment_status_description,
                status_reason: savedStatus.status_reason
            })
        } else {
            res.status(200).json({
                payStatus: transactStatus,
                status_reason: transactStatus
            })
        }

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
            console.log("error", error)
        }
        next(error)
    }
})

//check transaction details on successful processing
router.get("/checkStatus", async (req, res, next) => {
    try {
        const { OrderTrackingId } = req.query;
        let getTransact = await transactModel.findOne({ orderTrackingId: OrderTrackingId });
        if (!getTransact) {
            const error = new Error("Transaction not Found");
            error.statusCode = 404;
            throw error;
        }

        let transactStatus = getTransact.payment_status_description

        res.status(200).json({
            payStatus: transactStatus,
            paidAmount: getTransact.amount,
            paymentType: getTransact.paymentType,
            transactionId: getTransact.transactionId,
            currency: getTransact.currency,
            "orderTrackingId": OrderTrackingId
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
            console.log("error", error)
        }
        next(error)  
    }
})
//CallbackInstance of requesttoPay Payment
router.post("/status/:orderId", async (req, res, next) => {
    try {

        let orderId = req.params.orderId
        console.log("orderId from CallBack", orderId);
        console.log("requestBody", req.body);
        console.log("request", req);

        res.status(200).json("seen")
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
            console.log("error", error)
        }
        next(error)
    }
});

export default router;