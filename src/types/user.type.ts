import mongoose from "mongoose";

export interface UserPayload{
    _id: mongoose.Types.ObjectId
    role: string
}