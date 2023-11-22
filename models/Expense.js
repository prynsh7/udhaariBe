import mongoose  from "mongoose";

const expenseSchema = new mongoose.Schema({
    userId : {
        type: Number,
        ref:'User',
    },
    peerId : {
        type: Number,
        ref:'User',
    },
    description:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        default:"Active",
    },
    Amount:{
        type:Double,
        required:true,
    },
    settlementAt:{
        type:Date,
        required:true,
    },
    settledBy:{
        type:Number,
        ref:'User',
    },
    settlementType:{
        type:[{
            type:String,
            enum:["borrowed_full", "borrowed_half", "lend_full", "lend_half"]
        }],
        default:["borrowed_half"],
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
    },
    updatedAt:{
        type:Date,
    }
})
const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;