/**
 * import middleware
 */
import express from "express";
const app = express();
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bluebird from "bluebird";

/**
 * @middleware implementation
 */
dotenv.config();

/** 
 * @headers activation
 */
app.use(cors({ origin: "*", credentials: false }));
/**
 * Import @routes
 */

import pesaRoutes from './app/routes/pesapalTransactions.js';
import airtelRoutes from './app/routes/airtelTransactions.js'
import mtnRoutes from './app/routes/mtnTransactions.js'

/** 
 * implement routes
 */

app.use('/nyatimtn', mtnRoutes)
app.use('/nyatipay', pesaRoutes)
app.use("/nyatiairtel", airtelRoutes)
app.use(express.json());

/** 
 * render start-page
 */
app.get("/", (req, res, next) => {
    res.send('Running Nyati Server')
})

/** 
 * Error handling
 */
app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    
    res.status(status).json(message)
})

/** 
 * database connection && port server allocation
 */
let mongoUrl = process.env.MONGO_L_URL
console.log(mongoUrl)
mongoose.Promise = bluebird;
mongoose.connect(mongoUrl).then((result) => {
    console.log("Database connected successfully to", result.connections[0].name)
    app.listen(8000, () => {
        console.log("loaded, listening on port 8000");
    });
}).catch((error) => { 
    console.log("Connections Unsuccessful")
})
