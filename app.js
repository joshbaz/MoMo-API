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
app.use(cors({ origin: "*", credentials: true }));
/**
 * Import @routes
 */
import payRoutes from './app/routes/payment.js'
import pesaRoutes from './app/routes/pesapalTransactions.js';

/** 
 * implement routes
 */
app.use('/payment', payRoutes)
app.use('/nyatipay', pesaRoutes)

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
mongoose.Promise = bluebird;
mongoose.connect(mongoUrl).then((result) => {
    console.log("Database connected successfully to", result.connections[0].name)
    app.listen(8000, () => {
        console.log("loaded, listening on port 8000");
    });
}).catch((error) => { 
    console.log("Connections Unsuccessful")
})
