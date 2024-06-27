import axios from "axios";
import dotenv from "dotenv";
import payModel from "../models/payModel.js";
dotenv.config();

export const generateAuthAPITk = async (req, res, next) => {
  try {
    const findOneUser = await payModel.findOne();
    let primaryKey = process.env.MoMo_Collect_Primary;

    let getTime = new Date();
    let combinedVal = `${findOneUser.xReferenceId}:${findOneUser.apiUserKey}`;
    console.log(combinedVal, "combinedVal");
    let encoded64 = Buffer.from(combinedVal).toString("base64");
    console.log("encoded64", encoded64);
    let BasicAuth = `Basic ${encoded64}`;

    const sandboxTokenReq =
      "https://sandbox.momodeveloper.mtn.com/collection/token/";

    let generatedTk = await axios.post(
      sandboxTokenReq,
      {},
      {
        headers: {
          Authorization: BasicAuth,
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": primaryKey,
        },
      }
    );

    console.log("generatedTk", generatedTk.data.access_token);

    req.access_token = generatedTk.data.access_token;

    next();
  } catch (error) {
    console.log("error", error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
