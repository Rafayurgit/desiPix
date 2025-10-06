import dotenv from "dotenv";
dotenv.config();
import {OAuth2Client} from "google-auth-library";
import { User } from "../models/user.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import jwt from "jsonwebtoken";

console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_REDIRECT_URI:", process.env.GOOGLE_REDIRECT_URI);

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI // e.g. https://your-backend.com/auth/google/callback
);

export const googleRedirect = (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline", // ask for refresh token at first consent
    prompt: "consent",
    scope: ["openid", "profile", "email"],
  });
  return res.redirect(url);
};

export const googleCallback =async(req,res)=>{
  try {
    const code = req.query.code;
    if(!code) return res.redirect(`${process.env.CLIENT_URL}/auth/failure`);

    const {tokens}=await oauth2Client.getToken(code);
    const ticket = await oauth2Client.verifyIdToken({
      idToken:tokens.id_token,
      audience:process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const fullName = payload.name;
    const avatar = payload.picture;
    const emailVerified = payload.email_verified;

    let user = await User.findOne({ $or:[{googleId}, {email}]})

    if(user){
      if(!user.googleId){
        user.googleId= googleId;
        user.provider= "google";
        user.isVerified= user.isVerified || emailVerified;
        user.avatar = user.avatar || avatar;
        await user.save({validateBeforeSave:false})
      }
    }else{
      const baseUsername = (email?.split("@")[0] || fullName?.replace(/\s+/g, "").toLowerCase()) || `user${Date.now()}`;
      let username = baseUsername.toLowerCase();

      let suffix =0;
      while( await User.findOne({username})){
        suffix++;
        username = `${baseUsername}${suffix}`
      }

      const randomPassword = Math.random().toString(36).slice(2, 12);

      user = await User.create({
        fullName,
        username,
        email,
        password: randomPassword,
        googleId,
        provider: "google",
        avatar,
        isVerified:emailVerified
      })
    }

    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id);

    const cookieOptions ={
      httpOnly:true,
      secure:process.env.NODE_ENV === "production",
      sameSite:"lax"
    }

    return res
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .redirect(`${process.env.CLIENT_URL}/auth/success`);

  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return res.redirect(`${process.env.CLIENT_URL}/auth/failure`);
  }
}



const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error("❌ User not found:", userId);
      throw new Error("User not found");
    }

    console.log("✅ User found:", user._id);
    console.log("🔑 ACCESS_SECRET:", process.env.JWT_ACCESS_SECRET ? "Loaded" : "MISSING");
    console.log("🔑 REFRESH_SECRET:", process.env.JWT_REFRESH_SECRET ? "Loaded" : "MISSING");

    const accessToken =await generateAccessToken(user);
    const refreshToken =await generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    // throw new Error(
    //   "Something went wrong while generating refresh and access token"
    // );
    throw error;
  }
};

const signUp = async (req, res) => {

  try {
    const { fullName, username, email, password } = req.body;
  
    if (
      [fullName, username, email, password].some((field) => field?.trim() === "")
    ) {
      return res.status(400).json({ error: "All fileds are required" });
    }
  
    const existUser =await User.findOne({
      $or: [{ username }, { email }],
    });
  
    if (existUser) {
      return res
        .status(409)
        .json({ error: "User with email or username already exist" });
    }
  
    const user = await User.create({
      fullName,
      username: username.toLowerCase(),
      email,
      password,
    });
  
    //now to send user data back to frontend for keeping it login
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
  
    if (!createdUser) {
      return res
        .status(500)
        .json({ error: "something went wrong while registering user" });
    }
  
    return res
      .status(201)
      .json({ message: "User created successfully", user: createdUser });
  } catch (error) {
    console.error("Signup error:", error);  
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const signIn = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) return res.status(400).json({ error: "Email or username required" });

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    return res.status(404).json({ error: "User does not exist SingUP first!" });
  }


  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    return res.status(401).json({ error: "Invalid Password" });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({ message: "User loggedIn successfully" });
};

const logOut = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken: 1,
        },
      },
      {
        new: true,
      }
    )
  
    const options={
      httpOnly:true,
      secure:true
    }
  
    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options).json({message:" User logged Out "})
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const refreshAccessToken = async(req, res)=>{

    console.log("Cookies received:", req.cookies);
    console.log("Body received:", req.body);
    
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    console.log("Incoming refresh token:", incomingRefreshToken);


    if(!incomingRefreshToken){
        return res.status(401).json({error:"Unauthorized request"})
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET)
        const user =await User.findById(decodedToken._id);
    
        if(!user){
            return res.status(401).json({error:"Invalid refresh token"})
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            return res.status(401).json({error:"Refresh toekn expired or used"})
        }
    
        const options ={
            httpOnly:true,
            secure:true
        }
    
        const {accessToken, refreshToken}=await generateAccessAndRefereshTokens(user._id);
    
        return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken).json({message:"Access token refreshed"})
    
    } catch (error) {
        return res.status(401).json({error: error.message || "Invalid refresh token"})
    }
}

const changeCurrentPassword = async( req,res)=>{

    const {oldPassword, newPassword}= req.body;

    const user =await User.findById(req.user?._id);
    const isPasswordCorrect =await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        return res.status(400).json({error:"Invalid old paddword"})
    }

    user.password=newPassword;
    await user.save({validateBeforeSave:false});

    return res.status(200).json({message:"Passwprd changes successfully"})
}


export { signUp, signIn, logOut, refreshAccessToken, changeCurrentPassword};
