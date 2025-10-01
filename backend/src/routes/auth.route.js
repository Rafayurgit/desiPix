import { Router } from "express";
import {signUp, singIn, logOut} from "../controller/auth.controller";
import { verifyJwt } from "../middleware/auth.middleware";

const router = Router();

router.route("/signUp").post(signUp);
router.route("/signIn").post(singIn);

//secured route
router.route("/logOut").post(verifyJwt, logOut)


export default router