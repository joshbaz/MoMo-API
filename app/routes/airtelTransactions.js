import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import transactModel from "../models/TransactionModel.js"
import { generateAirtelAuthTk } from "../middleware/AirtelCreateToken.js";
import { v4 as uuidv4 } from "uuid";
import axios from 'axios';
import multer from "multer";

import nodemailer from "nodemailer";
import hogan from "hogan.js";
import fs from "fs";
import { request } from "http";
const router = express.Router();


dotenv.config();

const upload = multer({
    storage: multer.memoryStorage()
})

router.post("/donate", upload.none(), generateAirtelAuthTk, async (req, res, next) => {
    try {
        console.log("airtel bearerTk", req.airtel_access_token);

        const createdUUID = uuidv4();

        if (req.body.paymentType === "Airtel") {
            let Airtel_URL = process.env.Production_State === "production" ? process.env.Airtel_Production_Url : process.env.Airtel_Staging_Url;

            let AirtelRequestLink = `${Airtel_URL}/merchant/v2/payments/`

            let headers = {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-Country": "UG",
                "X-Currency": "UGX",
                "Authorization": req.airtel_access_token
            }
            let requestParameters = {
                "reference": "Testing Transaction",
                "subscriber": {
                    "country": "UG",
                    "currency": "UGX",
                    "msisdn": req.body.phonenumber //9 DIGITS VALUE
                },
                "transaction": {
                    "amount": 1000,
                    "country": "UG",
                    "currency": "UGX",
                    "id": createdUUID
                }
            }

            let submitOrderRequest = await axios.post(AirtelRequestLink, requestParameters, { headers: headers });

            if (submitOrderRequest.status.success) {
                
                const createTransact = new transactModel({
                    _id: new mongoose.Types.ObjectId(),
                    transactionType: "donation",
                    paymentType: "Airtel-Money",
                    amount: req.body.amount,
                    purpose: req.body.note,
                    currency: "UGX",
                    email: req.body.email,
                    phonenumber: req.body.phonenumber,
                    fistname: req.body.firstname,
                    lastname: req.body.lastname,
                    orderTrackingId: submitOrderRequest.data.transaction.id,
                    payment_status_description: "Pending"
                })

                createTransact.save();

                res.status(200).json({
                    orderTrackingId: submitOrderRequest.data.transaction.id
                })
            }
            
        } else {
            res.status(500).json("Check Payment Selected")
        }
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
})


router.get("/transact_statuses", generateAirtelAuthTk, async (req, res, next) => {
    try {
        const { OrderTrackingId } = req.query;

        let getTransact = await transactModel.findOne({ orderTrackingId: OrderTrackingId });

        if (!getTransact) {
            const error = new Error("Transaction not Found");
            error.statusCode = 404;
            throw error;
        }

        let Airtel_URL = process.env.Production_State === "production" ? process.env.Airtel_Production_Url : process.env.Airtel_Staging_Url;

        let AirtelRequestLink = `${Airtel_URL}/standard/v2/payments/${OrderTrackingId}`

        let headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-Country": "UG",
            "X-Currency": "UGX",
            "Authorization": req.airtel_access_token
        }

        let submitStatusRequest = await axios.get(AirtelRequestLink, { headers: headers });
        let transactStatus = submitStatusRequest.data.transaction.status
        const selectMessage = (shortMessage) => {
            switch (shortMessage) {
                case "TIP":
                    return "Transaction In Progress";
                case "TF":
                    return "Transaction has Failed";
                case "TS":
                    return "Transaction Successful";
                case "TP":
                    return "Transaction Pending"
                default:
                    return null;
            }
        }
        if (transactStatus !== getTransact.payment_status_description) {

            /**
             * TP - Transaction Pending
             * TIP - Transaction in Progress
             * TF - Transaction has Failed
             * TS - Transaction Successful
             */
           
            getTransact.transactionId = submitStatusRequest.data.transaction.airtel_money_id;
            getTransact.payment_status_description = transactStatus
            getTransact.status_reason = submitStatusRequest.data.transaction?.message ? submitStatusRequest.data.transaction?.message : null;


            let savedStatus = getTransact.save();
            
            res.status(200).json({
                transactionId: savedStatus.transactionId,
                payStatus: selectMessage(savedStatus.payment_status_description),
                status_reason: savedStatus.status_reason
            })
        } else {
            res.status(200).json({
                payStatus: selectMessage(transactStatus),
                status_reason: submitStatusRequest.data.transaction?.message
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

        const selectMessage = (shortMessage) => {
            switch (shortMessage) {
                case "TIP":
                    return "Transaction In Progress";
                case "TF":
                    return "Transaction has Failed";
                case "TS":
                    return "Transaction Successful";
                case "TP":
                    return "Transaction Pending"
                default:
                    return null;
            }
        }

        res.status(200).json({
            payStatus: selectMessage(transactStatus),
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
export default router;