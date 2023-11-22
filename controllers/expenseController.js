import User from "../models/User.js"
import Expense from "../models/Expense.js"

export const filterExpenses = async(req, res) =>{
    const {email, filterType} = req.body;
    try {
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Server error"
        })
    }
}