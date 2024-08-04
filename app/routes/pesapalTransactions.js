import express from "express";
import dotenv from "dotenv";
import { generatePesaAuthTk } from "../middleware/PesaCreateToken.js";
import { generateIPN_ID } from "../middleware/PesaIPN.js";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import multer from 'multer'
const router = express.Router();
dotenv.config();

const upload = multer({
    storage: multer.memoryStorage()
})

//make donation.
router.post("/donate", upload.none(), generatePesaAuthTk, generateIPN_ID, async (req, res, next) => {
    try {

        let {body} = req
        console.log("tokenRP", req.bearertk, req.ipn_id);
        console.log(body, "Body", req.body);
        
        const createdUUID = uuidv4();

        if (req.body.paymentType === "Visa") {
            let PesaRequestLink = `${process.env.PESA_S_URL}/api/Transactions/SubmitOrderRequest`

            let headers = {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": req.bearertk
            }

            let requestParameters = {
                id: createdUUID,
                currency: "ugx",
                amount: req.body.amount,
                description: `Donation- ${req.body.note}`,
                callback_url: "https://staging.nyatimotionpictures.com/",
                cancellation_url: "", //optional
                notification_id: req.ipn_id,
                "branch": "",
                billing_address: {
                    phone_number: req.body.phonenumber,
                    email_address: req.body.email,
                    country_code: "", //optional
                    first_name: req.body.firstname, //optional
                    "middle_name": "",
                    last_name: req.body.lastname,
                    "line_1": "",
                    "line_2": "",
                    "city": "",
                    "state": "",
                    "postal_code": "",
                    "zip_code": ""
                }
            }

            let submitOrder = await axios.post(PesaRequestLink, requestParameters, { headers: headers });
            console.log("submitOrder", submitOrder.data);

            if (submitOrder.data.error) {
                next(submitOrder.data.error);
            } else {
                console.log("uuid", createdUUID)
                res.status(200).json({
                    // token: req.bearertk,
                    // ipn: req.ipn_id,
                    // createdUUID: createdUUID
                    ...submitOrder.data
                })
            }

        } else if(req.body.paymentType === "Airtel") {
            res.status(500).json("No Payment")
        } else if (req.body.paymentType === "MTN") {
            res.status(500).json("No Payment")
        }  

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }


})

router.post("/tansact_status/", async (req, res, next) => {
    try {
        console.log("working to make connections", req.body, req.params);
        
        res.status("done");
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
        }
        next(error)
    }

})

export default router;