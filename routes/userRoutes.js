import express from "express"
const router = express.Router()

// import controllers
import {createUser, authUser, getProfile, updateProfile} from "../controllers/userController.js"

router.route("/createUser").post(createUser)
router.route("/authUser").post(authUser)
router.route("/getProfile").get(getProfile)
router.route("/updateProfile").put(updateProfile)

export default router;