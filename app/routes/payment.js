import express from "express";
import {  createAPIUser, getAPIUser } from "../middleware/MMCreateAPIUser.js";
import dotenv from "dotenv";
import { makePaymentRequest, makePaymentSandBox } from "../controllers/paymentController.js";
import { generateAuthAPITk } from "../middleware/MMToken.js";

const router = express.Router();
dotenv.config();

router.get("/paymovie", async (req, res, next) => {
  let date = new Date();
  let datenow = new Date(
    date.toLocaleString("en-us", { timeZone: "Africa/Nairobi" })
  );
  console.log("date", datenow);
  function parseDate(innerdate) {
    return innerdate < 10 ? "0" + innerdate : innerdate;
  }
  let fullyear = datenow.getFullYear();
  let month = parseDate(datenow.getMonth() + 1);
  let dates = parseDate(datenow.getDate());
  let hour = parseDate(datenow.getHours());
  let minutes = parseDate(datenow.getMinutes());
  let seconds = parseDate(datenow.getSeconds());

  let timestamp =
    fullyear +
    "" +
    month +
    "" +
    dates +
    "" +
    hour +
    "" +
    minutes +
    "" +
    seconds;
  console.log("date", datenow, timestamp);

  res.status(200).json("done");
});

// router.post("/pay", createAPIUser, getAPIUser, generateAuthAPITk, makePaymentRequest);

router.post(
  "/pay",

  makePaymentSandBox
);
export default router;
