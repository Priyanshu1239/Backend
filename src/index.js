import mongoose from "mongoose";
import dotenv from "dotenv";    
import connectDB from "./db/db.js";
//import express from "express";
import { app } from "./app.js";

//const app = express();
dotenv.config({ path: "./.env" });


connectDB()
.then(() => {
    console.log("Connected to MongoDB");

    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
})
.catch((err) => {
    console.error("Database connection error:", err);
});













/*
(async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}\${DB_NAME}`)
        app.on((error)=>{
            console.log("Errror",error);
            throw error;
        })

        app.listen(process.env.PORT,()=>{
           console.log("Connected")
        })

    } catch (error) {
        console.log("Error");
        throw error;
    }
})()

*/