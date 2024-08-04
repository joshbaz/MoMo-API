import axios from "axios"
import dotenv from "dotenv";
dotenv.config();

//generate pesapal access token
export const generatePesaAuthTk = async (req, res, next) => {
    try {

        console.log("Body", req.body);
        let payload = {
            consumer_key: "TDpigBOOhs+zAl8cwH2Fl82jJGyD8xev",
            consumer_secret: "1KpqkfsMaihIcOlhnBo/gBZ5smw="
        }

        console.log("payload",payload)

        let headers = {
            "Content-Type": "application/json",
            "Accept": "*/*"
        }

        const tkLink = `${process.env.PESA_S_URL}/api/Auth/RequestToken`;

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