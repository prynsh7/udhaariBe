import express from "express"
const router = express.Router()

// import controllers
import { createUser, authUser, getProfile, updateProfile, getDashboardData } from "../controllers/userController.js"
import { jwtToken } from "../middlewares/jwtToken.js";

router.route("/createUser").post(createUser)
router.route("/authUser").post(authUser)
router.route("/updateProfile").put(jwtToken, updateProfile)

router.route("/getProfile").get(jwtToken, getProfile)
router.route("/dashboard").get(jwtToken, getDashboardData)


export default router;