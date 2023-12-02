import User from "../models/User.js"
import Expense from "../models/Expense.js"

export const addFriend = async(req, res) =>{
    const {email} = req.user;
    const {peerMail} = req.body;
    try {
        let peer = await User.findOne({email:peerMail});
        if(!peer){
            peer = await User.create({
                username:peerMail,
                password:peerMail,
                email:peerMail
            })
        }

        const userId = req.user._id.toString();
        const peerId = peer._id.toString();

        if(userId === peerId){
            return res.status(401).json({
                success:false,
                message:"User and peer can't be same."
            })
        }

        const peerCheck = await Expense.find({
            userId:userId,
            peerId:peerId,
        })

        if(peerCheck){
            return res.status(400).json({
                success:false,
                message:"Peer is already a friend."
            })
        }

        const expense = await Expense.create({
            userId:userId,
            peerId:peerId,
            description:"",
            status:"Inactive",
            amount:0
        })

        return res.status(200).json({
            success:true,
            data:expense,
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
        const friends = await Expense.distinct({
            $or:[
                {userId:id},
                {peerId:id}
            ],
            $or:[
                {status:"Inactive"}
            ]
        });

        let friendData = [];
        for(let i=0; i<friends.length; i++)
        {
            if(friends[i].userId===id){
                const data = await User.findById(friends[i].peerId);
                friendData.push(data);
            }else{
                const data = await User.findById(friends[i].userId);
                friendData.push(data);
            }
        }

        return res.status(200).json({
            success:true,
            message:"List of friends fetched.",
            data:friendData
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
    const {mail, description, settlementType} = req.body; // peerId
    let {amount} = req.body;

    if(!mail || !description || !amount || !settlementType){
        return res.status(400).json({
            success:false,
            message:"All fields are required."
        })
    }

    try {
        const peer = await User.findOne({email:mail});
        if(!peer){
            return res.status(400).json({
                success:false,
                message:"Peer not found"
            })
        }
        const peerId = peer._id.toString();

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
        let peerData = [];
        if(filter === "You owe"){
            const filteredResponse = await Expense.find({
                $or:[
                    {userId:id},
                    {peerId:id}
                ],
                amount:{$gt:0}
            });


            // username , peername
            for(let i=0; i<filteredResponse.length; i++)
            {
                if(filteredResponse[i].userId===id)
                {
                    const peer = await User.findById(filteredResponse[i].peerId);
                    const obj = {
                        peerName : peer.username,
                        peerMail : peer.email,
                        data : filteredResponse[i]
                    }
                    peerData.push(obj);
                }else{
                    const peer = await User.findById(filteredResponse[i].userId);
                    const obj = {
                        peerName : peer.username,
                        peerMail : peer.email,
                        data : filteredResponse[i]
                    }
                    peerData.push(obj);
                }
            }
            return res.status(200).json({
                success:true,
                message:"Expense list fetched successfully.",
                data : peerData
            })
        }

        if(filter === "Owe you"){
            const filteredResponse = await Expense.find({
                $or:[
                    {userId:id},
                    {peerId:id}
                ],
                amount:{$lt:0}
            });

            for(let i=0; i<filteredResponse.length; i++)
            {
                if(filteredResponse[i].userId===id)
                {
                    const peer = await User.findById(filteredResponse[i].peerId);
                    const obj = {
                        peerName : peer.username,
                        peerMail : peer.email,
                        data : filteredResponse[i]
                    }
                    peerData.push(obj);
                }else{
                    const peer = await User.findById(filteredResponse[i].userId);
                    const obj = {
                        peerName : peer.username,
                        peerMail : peer.email,
                        data : filteredResponse[i]
                    }
                    peerData.push(obj);
                }
            }

            return res.status(200).json({
                success:true,
                message:"Expense list fetched successfully.",
                data : peerData
            })
        }

        const filteredResponse = await Expense.find({
            $or : [
                {userId:id},
                {peerId:id}
            ],
            status:{
                $nin: ["Inactive", "Inactive:UNREG"]
            }
        });

        for(let i=0; i<filteredResponse.length; i++)
        {
            if(filteredResponse[i].userId===id)
            {
                const peer = await User.findById(filteredResponse[i].peerId);
                const obj = {
                    peerName : peer.username,
                    peerMail : peer.email,
                    data : filteredResponse[i]
                }
                peerData.push(obj);
            }else{
                const peer = await User.findById(filteredResponse[i].userId);
                const obj = {
                    peerName : peer.username,
                    peerMail : peer.email,
                    data : filteredResponse[i]
                }
                peerData.push(obj);
            }
        }

        return res.status(200).json({
            success:true,
            message:"Expense list fetched successfully.",
            data : peerData
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Server error"
        })
    }
}