import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const generateAirtelAuthTk = async (req, res, next) => {
    try {
        let consumerKey = process.env.Production_State === "production" ? process.env.Airtel_ConsumerKey : process.env.Airtel_Test_ConsumerKey;

        let consumerSecret = process.env.Production_State === "production" ? process.env.Airtel_ConsumerSecret : process.env.Airtel_Test_ConsumerSecret;

        let payload = {
            client_id: consumerKey,
            client_secret: consumerSecret,
            grant_type: "client_credentials"
        }

        let headers = {
            "Content-Type": "application/json",
            "Accept": "*/*"
        }

        let Airtel_URL = process.env.Production_State === "production" ? process.env.Airtel_Production_Url : process.env.Airtel_Staging_Url;

        const tkLink = `${Airtel_URL}/auth/oauth2/token`;

        let generatedTk = await axios.post(tkLink, payload, { headers: headers })
        let Bearertk = `Bearer ${generatedTk.data.token}`;
        req.airtel_access_token = Bearertk;

        next();
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error)
    }
}