import { Schema } from "mongoose";
import mongoose from "mongoose";
import dotenv from "dotenv";  
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();  // Load environment variables

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        index: true,
        unique: true, // Ensures no duplicate emails
    },
    avatar: {
        type: String, // Cloudinary URL
        required: true,
    },
    coverImage: {
        type: String, // Cloudinary URL
    },
    watchHistory: [
        { 
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    refreshToken: {
        type: String,
    }
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare entered password with stored hashed password
userSchema.methods.isPasswordCorrect = async function (enteredPassword) {
    const match = await bcrypt.compare(enteredPassword, this.password);
    console.log("Entered Password:", enteredPassword);
    console.log("Stored Hashed Password:", this.password);
    console.log("Password Match:", match);
    return match;
};


// Generate Access Token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign({ _id: this._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

// Export the User model
export const User = mongoose.model("User", userSchema);
