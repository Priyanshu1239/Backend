import mongoose from "mongoose";
//import { DB_NAME } from "./constants";
//import express from "express";
import connectDB from "../db/db.js";
import dotenv from "dotenv";    


//const app = express();
dotenv.config({
    path:'./env'
})


connectDB()









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