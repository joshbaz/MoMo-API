import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const generateAirtelAuthTk = async (req, res, next) => {
    try {
        let payload = {
            client_id: process.env.Airtel_ConsumerKey,
            client_secret: process.env.Airtel_ConsumerSecret,
            grant_type: "client_credentials"
        }

        let headers = {
            "Content-Type": "application/json",
            "Accept": "*/*"
        }

        const tkLink = `${process.env.Airtel_Staging_Url}/auth/oauth2/token`;

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