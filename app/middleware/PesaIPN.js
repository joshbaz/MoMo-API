import axios from "axios"
import dotenv from "dotenv"
//import payModel from '../models/payModel.js';

dotenv.config();
/** generateIPNID */
export const generateIPN_ID = async (req, res, next) => {
    try {
        let Bearertk = `Bearer ${req.pesa_access_token}`;

        const checkIPN = await getIPN(Bearertk);

        if (checkIPN.type === 'success') {
            console.log("ipn exists");
            req.bearertk = Bearertk;
            req.ipn_id = checkIPN.n_id;
            next()
        } else if (checkIPN.type === "not found") {
            console.log("no IPN REGISTERED")

            let register = registerIPN(Bearertk);

            if (register.type === 'success') {
                req.bearertk = Bearertk;
                req.ipn_id = register.n_id;

                next();
            } else {
                next(register.error)
            }

        } else {
            next(checkIPN.error)
        }

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

//getIPN - FUNCTION
const getIPN = async (token) => {
    try {

        let headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": token
        }

        let PESA_URL = process.env.Production_State === "production" ? process.env.PESA_LIVE_URL : process.env.PESA_Sandbox_URL

        const PesaRequestLink = `${PESA_URL}/api/URLSetup/GetIpnList`

        let getRegistration = await axios.get(PesaRequestLink, { headers: headers });
        let getRegister_Payload;
        //console.log("first here d", getRegistration.data)
        if (getRegistration.data.length > 0) {
            console.log("here d")

            let registerDetail = getRegistration.data.filter((data, index) => data.url.includes(`${process.env.NG_Pesa_Callback}`))

            console.log('included', registerDetail);
            if (registerDetail.length > 0) {
                return getRegister_Payload = {
                    n_id: registerDetail[0].ipn_id,
                    type: "success"
                }
            } else {
                return getRegister_Payload = {
                    n_id: null,
                    type: "not found",
                    code: 404
                }
            }



        } else {


            return getRegister_Payload = {
                n_id: null,
                type: "not found",
                code: 404
            }
        }


    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;

        }
        let getRegister_Payload
        return getRegister_Payload = {
            n_id: null,
            type: "error",
            error: error
        }
        // next(error)
    }
}

/** Does the IPN Send only once */
const registerIPN = async (token) => {
    try {

        
        let requestParameters = {
            url: `${process.env.NG_Pesa_Callback}`,
            "ipn_notification_type": "GET"
        }
        let headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": token
        }

        let PESA_URL = process.env.Production_State === "production" ? process.env.PESA_LIVE_URL : process.env.PESA_Sandbox_URL

        const PesaRequestLink = `${PESA_URL}/api/URLSetup/RegisterIPN`

        let registration = await axios.post(PesaRequestLink, requestParameters, { headers: headers });

      
        
       
        return {
            n_id: registration.data.ipn_id,
            type: success
         }   
        

        // next();
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
        }
        let getRegister_Payload
        return getRegister_Payload = {
            n_id: null,
            type: "error",
            error: error
        }
    }
}