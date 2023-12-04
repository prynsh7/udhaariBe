import mongoose  from "mongoose";

const expenseSchema = new mongoose.Schema({
    userId : {
        type: String,
        ref:'User',
    },
    peerId : {
        type: String,
        ref:'User',
    },
    description:{
        type:String,
        required:false
    },
    status:{
        type:String,
        default:"Active",
    },
    amount:{
        type:Number,
        required:true,
    },
    settlementAt:{
        type:Date,
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
expenseSchema.index({ userId: 1, peerId: 1 }, { unique: true });
const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;