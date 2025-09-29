import { use } from "react";
import { User } from "../models/user.model";


const signUp = async (req,res)=>{
    const {fullName, username, email, password} = req.body;

    if([fullName,username,email,password].some((field)=>field?.trim()==="")){
        return res.status(400).json({error:"All fileds are required" })
    }

    const existUser = User.findOne({
        $or:[{ username}, {email}]
    })

    if(existUser){
        return res.status(409).json({error:"User with email or username already exist"})
    }

    const user = await User.create({
        fullName,
        username: username.toLowercase(),
        email,
        password
    })

    //now to send user data back to frontend for keeping it login
    const createdUser =await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        return res.status(500).json({error:"something went wrong while registering user"})
    }
}

const singIn = async(req,res)=>{

}

const logOut = async(req,res)=>{

}

export {
    signUp,singIn,logOut
}