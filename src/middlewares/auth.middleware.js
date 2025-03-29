import { apiError } from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";




export const verifyJWT =asyncHandler(async(req,res,next)=>{
try{
    const token =req.cookies?.accessToken || req.header
    ("Authorization")?.replace("Bearer","")

    if(!token){
        throw new apiError(401,"Unauthorized Error")
    }

    const decodeToken =jwt.verify(token,proccess.env.ACCESS_TOKEN_SECRET)

    const user =await User.findById(decodeToken?._id).select("-password -refreshToken")

    if(!user){
        throw new apiError(404,"User Not Found")
    }

    req.user=user;
    next()

  }catch(error){
        throw new apiError(401,error?.message || "Invalid access Token")
    }



})