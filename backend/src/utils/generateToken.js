import { User } from "../models/user.model"
import jwt from "jsonwebtoken"

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "Accesssupersecret"; 
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const JWT_REFRESH_SECRET= process.env.REFRESH_TOKEN_SECRET || "RefreshSecret";

export const generateAccessToken  = async(userId) =>{
    return jwt.sign({
        _id:userId._id,
        email:userId.email,
        username:userId.username,
        fullName:userId.fullName,
    }, JWT_ACCESS_SECRET, {expiresIn : JWT_EXPIRES_IN})
}

export const generateRefreshToken =async(userId)=>{
    return jwt.sign({
        _id:userId._id,
    },
    JWT_REFRESH_SECRET,
    {expiresIn:"7d"}
    
)
}

export const verifyToken  = async(token)=>{
    return jwt.verify(token, JWT_ACCESS_SECRET)
}

export const verifyRefreshToken  = async(token)=>{
    return jwt.verify(token, JWT_REFRESH_SECRET)
}