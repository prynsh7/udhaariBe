import User from "../models/User.js"
import Expense from "../models/Expense.js"

export const addFriend = async(req, res) =>{
    const {email} = req.user;
    const {peerMail} = req.body;
    try {
        let peer = await User.findOne({email:peerMail});
        let user = await User.findOne({email:email});
        if(!peer){
            peer = await User.create({
                username:peerMail,
                password:peerMail,
                email:peerMail,
                friends:[],
                status:"Inactive"
            })
        }

        const userId = req.user._id.toString();
        const peerId = peer._id.toString();
        const peerName = peer.username;
        const userName = req.user.username;

        if(userId === peerId){
            return res.status(401).json({
                success:false,
                message:"User and peer can't be same."
            })
        }

        const friendExists = user.friends.some(
            (friend) => friend.id === peerId && friend.username === peerName
        );
        
        if (friendExists) {
            return res.status(401).json({
                success: false,
                message: "Friend already exists.",
            });
        }
        
        user.friends.push({
            id: peerId,
            username: peerName,
        });

        peer.friends.push({
            id: userId,
            username: userName,
        });

        await user.save();
        await peer.save();

        return res.status(200).json({
            success:true,
            data:user,
            message:"Friend added successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Server error"
        })
    }
}

export const getFriends = async(req, res) =>{
    const {id} = req.user;
    try {
        const user = await User.findById(id);
        return res.status(200).json({
            success:true,
            message:"Friends fetched successfully",
            data: user.friends
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Server error"
        })
    }
}

export const createExpense = async(req, res) =>{
    const {id} = req.user;
    const {peerId, description, settlementType} = req.body;
    let {amount} = req.body;

    if(!peerId || !description || !amount || !settlementType){
        return res.status(400).json({
            success:false,
            message:"All fields are required."
        })
    }

    try {
        if(id === peerId){
            return res.status(401).json({
                success:false,
                message:"Cant create an expense with yourself."
            })
        }

        const friendExists = req.user.friends.some(
            (friend) => friend.id === peerId
        );

        if(!friendExists)
        {
            return res.status(401).json({
                success:false,
                message:"No friend exists."
            })
        }

        const peer = await User.findById(peerId);
        
        if(settlementType==="borrowed_half"){
            amount = -(amount/2);
        }else if(settlementType==="borrowed_full"){
            amount = -(amount);
        }else if(settlementType==="lend_half"){
            amount = amount/2;
        }

        const expense = await Expense.create({
            userId : id,
            peerId : peerId,
            peerName : peer.username,
            description : description,
            amount : amount,
            settlementType : settlementType
        })
        return res.status(200).json({
            success:true,
            message:"Expense created successfully.",
            data:expense
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Server error"
        })
    }
}

export const getExpenses = async(req, res) =>{
    const {id} = req.user;
    const {settlementType} = req.body;
    try {
        const filteredResponse = await Expense.find({
            settlementType:{$in: [settlementType] },
            $or:[
                {userId:id},
                {peerId:id}
            ]
        }).populate('userId', 'username').populate('peerId', 'username');

        if(filteredResponse.length===0){
            return res.status(401).json({
                success:false,
                message:"No expense found."
            })
        }

        return res.status(200).json({
            success:true,
            message:"Expenses fetched successfully.",
            data:filteredResponse
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Server error"
        })
    }
}

