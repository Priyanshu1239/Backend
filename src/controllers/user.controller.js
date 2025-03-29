import asyncHandler from '../utils/asyncHandler.js';
import {app} from '../app.js';
import {apiError} from '../utils/apiError.js';
import {User} from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import { apiResponse } from '../utils/apiResponse.js';
import jwt from "jsonwebtoken"
import bcrypt from 'bcrypt';


const generateAccessAndRefreshToken = async (userID) => {
    try {
        const user = await User.findById(userID);
        
        if (!user) {
            throw new apiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Save refresh token only if needed
        await User.findByIdAndUpdate(userID, { refreshToken }, { new: true });

        return { accessToken, refreshToken };

    } catch (error) {
        console.error("Error generating tokens:", error.message);
        throw new apiError(500, "Token generation failed");
    }
};



const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body;

    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new apiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({
        $or: [{ username: username.toLowerCase() }, { email: email }]
    });

    if (existingUser) {
        throw new apiError(409, "User already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path || "";

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar is required");
    }

    const Avatar = avatarLocalPath ? await uploadOnCloudinary(avatarLocalPath) : null;
    const CoverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    if (!Avatar) {
        throw new apiError(400, "Avatar upload failed");
    }

    // Manually hash password before creating user (Ensures password is hashed)
    //const salt = await bcrypt.genSalt(10);
    //const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        fullname,
        avatar: Avatar.url,
        coverImage: CoverImage?.url || "",
        email,
        password: hashedPassword, // Store hashed password
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new apiError(404, "User not found after creation");
    }

    return res.status(201).json(
        new apiResponse(200, createdUser, "User registered successfully")
    );
});

const loginUser =asyncHandler(async(req,res)=>{

    const { username, email, password } = req.body;

    if (!username && !email) {
        throw new apiError(400, "Email or username is required");
    }
    
    // Fix: Add `await` for User.findOne
    const user = await User.findOne({
        $or: [{ username }, { email }]
    });
    
    if (!user) {
        throw new apiError(400, "User not found");
    }
    
    // Fix: Ensure `isPasswordCorrect` method exists in User model
    const isPasswordValid = await user.isPasswordCorrect(password);
    console.log("Entered Password:", password);
    console.log("Stored Hashed Password:", user.password);
    console.log("Password Match:", isPasswordValid);
        
    if (!isPasswordValid) {
        throw new apiError(401, "Invalid password");
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    
    // Fix: Use correct syntax for `select`
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    
    const options = {
        httpOnly: true,
        secure: true
    };
    
    return res
        .status(200)
        .cookie("accessToken", accessToken, options) // Fix: use `options` instead of `option`
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
    


})

const loggedOutUser = asyncHandler(async(req,res)=> {
      await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
      )

      const options={
        httpOnly:true,
        secure:true
      }

      return res
      .status(200)
      .clearCookie("accessToken",options)
      .clearCookie("refreshToken",options)
      .json(new apiResponse(200,{},"User logged out"))

})

export{
    registerUser,
    loginUser,
    loggedOutUser
}