import { Router } from "express";
import {signUp, signIn, logOut, refreshAccessToken, changeCurrentPassword} from "../controller/auth.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { googleRedirect, googleCallback } from "../controller/auth.controller.js";

const router = Router();

router.route("/signUp").post(signUp);
router.route("/signIn").post(signIn);

//google routes
router.get("/google", googleRedirect);
router.get("/google/callback", googleCallback);

//secured route
router.route("/logOut").post(verifyJwt, logOut)
router.route("/refresh").post(refreshAccessToken)
router.route("/changePassword").post(verifyJwt, changeCurrentPassword)



export default router