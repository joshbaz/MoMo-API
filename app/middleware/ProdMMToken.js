import axios from "axios";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
dotenv.config();

// func to create Sandbox ApiUSER
const createAPIUser = async (subscription_Key) => {
    try {

        let APIUserLink_Sandbox = `${process.env.MoMo_SandboxURL}/v1_0/apiuser`
        const createdUUID = uuidv4();

        let apiUserCreationReq = await axios.post(APIUserLink_Sandbox, {
            providerCallbackHost: process.env.MoMo_CALLBACK_HOST_RM,
        }, {
            headers: {
                "X-Reference-Id": createdUUID,
                "Content-Type": "application/json",
                "Ocp-Apim-Subscription-Key": subscription_Key,
            }
        });

        console.log("apiUserRequest", apiUserCreationReq.data )

        return createdUUID
        
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
       throw error
    }
    
}

// func to get ApiKey
const getAPIKey = async (subscription_Key, apiUser) => {
    try {
        let apiKeyLink = `${process.env.MoMo_SandboxURL}/v1_0/apiuser/${apiUser}/apikey`;
        let getApiKeyReq = await axios.post(
            apiKeyLink,
            {}, {
            headers: {
                "Content-Type": "application/json",
                "Ocp-Apim-Subscription-Key": subscription_Key,
            }
        }
        );

        return getApiKeyReq.data.apiKey;

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        throw error
    }
}

export const generateMTNAuthTk = async (req, res, next) => {
    try {
        {/** primary Key */}
        let subscription_Key = process.env.Production_State === "production" ? process.env.MoMo_Prod_Collect_Primary : process.env.MoMo_Collect_Primary; 
       
        let apiUser = process.env.Production_State === "production" ? process.env.MoMo_Prod_ApiUser : await createAPIUser(subscription_Key);
        
        let apiKey = process.env.Production_State === "production" ? process.env.MoMo_Prod_ApiKey : await getAPIKey(subscription_Key, apiUser);

        {/** Generation of Basic Auth from ApiUser & ApiKey */ }
        let combinedKeys = Buffer.from(`${apiUser}:${apiKey}`).toString("base64");
        let BasicAuth = `Basic ${combinedKeys}`;
        
        let MoMo_BaseURL = process.env.Production_State === "production" ? process.env.MoMo_Prod_BASEURL : process.env.MoMo_SandboxURL;


        let TokenReqLink = `${MoMo_BaseURL}/collection/token/`


        let generatedTk = await axios.post(
            TokenReqLink, {},
            {
                headers: {
                    Authorization: BasicAuth,
                    "Content-Type": "application/json",
                    "Ocp-Apim-Subscription-Key": subscription_Key,
                }
            }
        )

        console.log("momo_access_token", generatedTk.data.access_token)
        let Bearertk = `Bearer ${generatedTk.data.access_token}`;
        req.mtn_access_token = Bearertk;
        next()
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}