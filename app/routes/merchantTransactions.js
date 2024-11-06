import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import transactModel from "../models/transactionModel.js"
import { v4 as uuidv4 } from "uuid";
import axios from 'axios';
import multer from "multer";
const router = express.Router();
dotenv.config();

const upload = multer({
    storage: multer.memoryStorage()
})

router.post("/donate", upload.none(), async (req, res, next) => {
    try {
        

        const createdUUID = uuidv4();

        if (req.body.paymentType === "MerchantPay") {

            const createTransact = new transactModel({
                _id: new mongoose.Types.ObjectId(),
                transactionType: "donation",
                paymentType: "MerchantPay",
                amount: req.body.amount,
                purpose: req.body.note,
                currency: "UGX",
                email: req.body.email,
                phonenumber: req.body.phonenumber,
                fistname: req.body.firstname,
                lastname: req.body.lastname,
                orderTrackingId: createdUUID,
                payment_status_description: "Transaction Pending"
            })

            createTransact.save();

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

router.get("/update", async (req, res, next) => {
    try {
        const { OrderTrackingId } = req.query;
        let getTransact = await transactModel.findOne({ orderTrackingId: OrderTrackingId });

        if (!getTransact) {
            const error = new Error("Transaction not Found");
            error.statusCode = 404;
            throw error;
        }

        let transactStatus = getTransact.payment_status_description

        // const selectMessage = (shortMessage) => {
        //     switch (shortMessage) {
        //         case "TIP":
        //             return "Transaction In Progress";
        //         case "TF":
        //             return "Transaction has Failed";
        //         case "TS":
        //             return "Transaction Successful";
        //         case "TP":
        //             return "Transaction Pending"
        //         default:
        //             return null;
        //     }
        // }

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

