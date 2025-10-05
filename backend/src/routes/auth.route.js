import { Router } from "express";
import {signUp, signIn, logOut, refreshAcceeToken, changeCurrectPassword} from "../controller/auth.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/signUp").post(signUp);
router.route("/signIn").post(signIn);

//secured route
router.route("/logOut").post(verifyJwt, logOut)
router.route("/refresh").post(refreshAcceeToken)
router.route("/changePassword").post(verifyJwt, changeCurrectPassword)


export default router