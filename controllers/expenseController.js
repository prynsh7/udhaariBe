import User from "../models/User.js"
import Expense from "../models/Expense.js"
import Friend from "../models/Friends.js";
import mongoose from "mongoose";
// import {ObjectId} from '';

export const addFriend = async (req, res) => {
    const { email } = req.user;
    const { peerMail } = req.body;
    try {
        let peer = await User.findOne({ email: peerMail });
        let user = await User.findOne({ email: email });
        if (!peer) {
            peer = await User.create({
                username: peerMail,
                password: peerMail,
                email: peerMail,
                friends: [],
                status: "Inactive"
            })
        }

        const userId = req.user._id.toString();
        const peerId = peer._id.toString();

        if (userId === peerId) {
            return res.status(400).json({
                success: false,
                message: "User and peer can't be same."
            })
        }


        const friendExists = await Friend.findOne({
            $or: [
                { userId: userId, peerId: peerId },
                { userId: peerId, peerId: userId }
            ]
        });

        if (friendExists) {
            return res.status(400).json({
                success: false,
                message: "Friend already exists."
            })
        }

        const friend = await Friend.create({
            userId: userId,
            peerId: peerId,
        })


        return res.status(200).json({
            success: true,
            message: "Friend added successfully.",
            friend: friend
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error"
        })
    }
}

export const getFriends = async (req, res) => {
    const { id } = req.user;
    try {



        const friends = await Friend.find({
            $or: [
                { userId: id },
                { peerId: id }
            ],

        }).populate('userId', 'username').populate('peerId', 'username')




        // const friendsList = friends.map((friend) => {
        //     if (friend.userId?._id?.toString() === id) {
        //         return {
        //             id: friend._id,
        //             userId: friend.peerId?._id,
        //             name: friend.peerId?.username,
        //         }
        //     } else {
        //         return {
        //             id: friend._id,
        //             userId: friend.userId?._id,
        //             name: friend.userId?.username,
        //         }
        //     }
        // }
        // );



        // const friendIds = friendsList.map(friend => friend.id);

        // const totalExpenses = await Expense.aggregate([
        //     {
        //         $match: {
        //             friendId: { $in: friendIds },
        //         }
        //     },
        //     {
        //         $group: {
        //             _id: "$friendId",
        //             totalExpense: { $sum: "$amount" }
        //         }
        //     }
        // ]);

        const friendExpenses = await Friend.aggregate([
            {
                $match: {
                    $or: [
                        { userId: id },
                        { peerId: id }
                    ]
                }
            },
            {
                $lookup: {
                    from: "expenses",
                    localField: "_id",
                    foreignField: "friendId",
                    as: "friendExpenses"
                },
            },
            {
                $addFields: {
                    totalExpense: {
                        $sum: "$friendExpenses.amount"
                    }
                }
            },

            {
                $addFields: {
                    otherId: {
                        $cond: {
                            if: { $eq: ["$userId", id] },
                            then: { $toObjectId: "$peerId" },
                            else: { $toObjectId: "$userId" }
                        }
                    }
                }
            },

            {
                $lookup: {
                    from: "users",
                    localField: "otherId",
                    foreignField: "_id",
                    as: "user",
                }
            },
            {
                $unwind: "$user"
            },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    peerId: 1,
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    totalExpense: 1,
                    user: {
                        _id: 1,
                        username: 1,
                        email: 1,
                        status: 1,
                        createdAt: 1,
                        updatedAt: 1,
                    }
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            message: "Friends fetched successfully.",
            data: friendExpenses
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}

export const createExpense = async (req, res) => {

    const { friendId, description, settlementType } = req.body;
    let { amount } = req.body;

    if (!friendId || !description || !amount || !settlementType) {
        return res.status(400).json({
            success: false,
            message: "All fields are required."
        })
    }

    try {

        const friendExists = await Friend.findOne({
            _id: friendId,
        });

        if (!friendExists) {
            return res.status(401).json({
                success: false,
                message: "Friend doesn't exists."
            })
        }


        if (settlementType === "borrowed_half") {
            amount = -(amount / 2);
        } else if (settlementType === "borrowed_full") {
            amount = -(amount);
        } else if (settlementType === "lend_half") {
            amount = amount / 2;
        }

        const expense = await Expense.create({
            friendId: friendExists._id,
            description: description,
            amount: amount,
            settlementType: settlementType
        })
        return res.status(200).json({
            success: true,
            message: "Expense created successfully.",
            data: expense
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}

export const getExpenses = async (req, res) => {
    const { id } = req.user;
    const { settlementType } = req.body;
    try {
        const filteredResponse = await Expense.find({
            settlementType: { $in: [settlementType] },
            $or: [
                { userId: id },
                { peerId: id }
            ]
        }).populate('userId', 'username').populate('peerId', 'username');

        if (filteredResponse.length === 0) {
            return res.status(401).json({
                success: false,
                message: "No expense found."
            })
        }
        return res.status(200).json({
            success: true,
            message: "Expenses fetched successfully.",
            data: filteredResponse
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}

export const getExpensesById = async (req, res) => {
    const { id: friendId } = req.params


    try {
        const filteredResponse = await Expense.find({
            friendId: friendId
        })



        if (filteredResponse.length === 0) {
            return res.status(401).json({
                success: false,
                message: "No expense found."
            })
        }

        const totalExpenseAggregate = await Expense.aggregate([{
            $match: {
                friendId: mongoose.Types.ObjectId(friendId)
            }
        },
        {
            $group: {
                _id: "$friendId",
                totalExpense: { $sum: "$amount" }
            }
        }
        ]);


        return res.status(200).json({
            success: true,
            message: "Expenses fetched successfully.",
            data: filteredResponse,
            total: totalExpenseAggregate[0]?.totalExpense || 0
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}

