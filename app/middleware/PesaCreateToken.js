import axios from "axios"
import dotenv from "dotenv";
dotenv.config();

//generate pesapal access token
export const generatePesaAuthTk = async (req, res, next) => {
    try {

        console.log("Body", req.body);
        let consumer_key = process.env.Production_State === "production" ? process.env.LIVE_PESA_KEY : process.env.SANDBOX_PESA_KEY

        let consumer_secret = process.env.Production_State === "production" ? process.env.LIVE_PESA_SECRET : process.env.SANDBOX_PESA_SECRET
        //test credentials
        let payload = {
            consumer_key: consumer_key,
            consumer_secret: consumer_secret
        }

       // console.log("payload", payload, process.env.SECRETVA)

     //   console.log("process.env.Production_State", process.env.Production_State, process.env.PESA_LIVE_URL, process.env.PESA_Sandbox_URL)
        
       // console.log("SANDBOX_PESA_SECRET", process.env.SANDBOX_PESA_SECRET)

        let headers = {
            "Content-Type": "application/json",
            "Accept": "*/*"
        }

        let PESA_URL = process.env.Production_State === "production" ? process.env.PESA_LIVE_URL : process.env.PESA_Sandbox_URL

        const tkLink = `${PESA_URL}/api/Auth/RequestToken`;

        let generatedTk = await axios.post(tkLink, payload, { headers: headers });

        //console.log("generatedTk", generatedTk)
        req.pesa_access_token = generatedTk.data.token;

        next();
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}