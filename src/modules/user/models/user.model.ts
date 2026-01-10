import mongoose, { Document, Schema } from "mongoose"

export interface IUser extends Document{
    userName: string
    email: string
    phoneNumber: string
    password: string
    createdAt: Date
    updatedAt: Date
    role: string
}
const userSchema = new Schema<IUser>(
    {
        userName: {type: String, required: true, unique: true},
        email: {type: String, required: true, unique: true},
        phoneNumber: {type: String,required: true, unique: true },
        createdAt: {type: Date, default: Date.now},
        updatedAt: { type: Date, default: Date.now},
        role: {type: String , enum:["user","customer", "admin","staff"],default: "user"},


    },{
        timestamps: true
    }
)
const User = mongoose.model<IUser>("User", userSchema)
export default User