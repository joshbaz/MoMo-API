/**
 * import middleware insert
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
    res.send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nyati Server Status</title>
            <style>
                body {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background-color: #141118; /* Dark background */
                    font-family: Arial, sans-serif;
                }
                .status {
                    text-align: center;
                    padding: 20px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    background-color: #1A171E; /* Background color for the status box */
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
                }
                h1 {
                    color: #F2F2F2; /* Updated primary color */
                }
                p {
                    color: #FFFAF6; /* Secondary white */
                }
                a {
                    color: #F2F2F2; /* Updated primary color for links */
                    text-decoration: none;
                }
                a:hover {
                    text-decoration: underline; /* Underline on hover */
                }
                img {
                    max-width: 150px; /* Set a maximum width for the logo */
                    margin-bottom: 15px; /* Add some space below the logo */
                }
            </style>
        </head>
        <body>
            <div class="status">
                <img src="https://ik.imagekit.io/nyatimot/Pages/Universal+Home/Logos/Logo1.svg?updatedAt=1724072184503" alt="Nyati Motion Pictures Logo">
                <h1>API Server is Live</h1> <!-- Updated Message -->
                <p>The Nyati Motion Pictures API server is up and running.</p>
                <p>For any inquiries, contact us at <a href="mailto:info@nyatimotionpictures.com">info@nyatimotionpictures.com</a></p>
            </div>
        </body>
        </html>`)
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
