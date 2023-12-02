import express from "express"
const router = express.Router()

import {addFriend, getFriends, createExpense, getExpenses} from "../controllers/expenseController.js";
// import {decodeJwt} from "../middlewares/jwtToken.js"
import {jwtToken} from "../middlewares/jwtToken.js";

router.route("/addFriend").post(jwtToken, addFriend);
router.route("/createExpense").post(jwtToken, createExpense);
router.route("/getFriends").get(jwtToken, getFriends);
router.route("/getExpenses").get(jwtToken, getExpenses);

export default router;