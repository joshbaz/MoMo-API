//Ocp-Apim-Subscription-Key  is the primary Key
//
import mongoose from 'mongoose'
import payModel from "../models/payModel.js";
import axios from "axios";
import { v5 as uuidv5 } from "uuid";
import dotenv from "dotenv";
dotenv.config();

const generateUUID = (primary_key, secondary_key) => {
  const combinedKeys = `${primary_key}-${secondary_key}`;

  console.log("combinedKeys", combinedKeys);

  const createdUUID = uuidv5(combinedKeys, uuidv5.URL);

  return createdUUID;
};

export const createAPIUser = async (req, res, next) => {
  try {
    let primaryKey = process.env.MoMo_Collect_Primary;
    let secondaryKey = process.env.MoMo_Collect_Secondary;

    console.log(primaryKey, secondaryKey);
    let uniqueUUID = generateUUID(primaryKey, secondaryKey);

    console.log("uniqueIDs", uniqueUUID);
    const sandboxAPI_User =
      "https://sandbox.momodeveloper.mtn.com/v1_0/apiuser";

    //check for existing model
    const findOneUser = await payModel.findOne();

    if (!findOneUser) {
      const newApiUser = new payModel({
        _id: new mongoose.Types.ObjectId(),
        xReferenceId: uniqueUUID,
      });

      await newApiUser.save();

      await axios.post(
        sandboxAPI_User,
        {
          providerCallbackHost: "localhost:8000",
        },
        {
          headers: {
            "X-Reference-Id": uniqueUUID,
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": primaryKey,
          },
        }
      );

      //    const apiKeyLink = `https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/${uniqueUUID}/apikey`;
      next();
    } else {
      next();
    }

    //console.log("res", createUser);
    //res.status(createUser.status).json(createUser.data);
  } catch (error) {
    console.log("errrrrrrrrrrr", error);
    if (error?.response?.status === 409) {
      next();
    }
  }
};

export const getAPIUser = async (req, res, next) => {
  try {
    let primaryKey = process.env.MoMo_Collect_Primary;
    let secondaryKey = process.env.MoMo_Collect_Secondary;

    //console.log(primaryKey, secondaryKey);
    let uniqueUUID = generateUUID(primaryKey, secondaryKey);

    const apiKeyLink = `https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/${uniqueUUID}/apikey`;

    //check for existing model
    const findOneUser = await payModel.findOne();

    if (!findOneUser) {
      const getApiKey = await axios.post(
        apiKeyLink,
        {},
        {
          headers: {
            "X-Reference-Id": uniqueUUID,
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": primaryKey,
          },
        }
      );

         req.xReferenceId = uniqueUUID;
      req.apiUserKey = getApiKey.data.apiKey;
      const newApiUser = new payModel({
        _id: new mongoose.Types.ObjectId(),
        xReferenceId: uniqueUUID,
        apiUserKey: getApiKey.data.apiKey,
      });

      await newApiUser.save();

      next();
    } else if (!findOneUser.apiUserKey) {

        const getApiKey = await axios.post(
          apiKeyLink,
          {},
          {
            headers: {
              "X-Reference-Id": uniqueUUID,
              "Content-Type": "application/json",
              "Ocp-Apim-Subscription-Key": primaryKey,
            },
          }
        );


        req.apiUserKey = getApiKey.data.apiKey;

        findOneUser.apiUserKey = getApiKey.data.apiKey; 

        await findOneUser.save();

        next()
    } else {
          next();
    }

    //console.log("getApiKey", getApiKey.data.apiKey);

    //next();
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
