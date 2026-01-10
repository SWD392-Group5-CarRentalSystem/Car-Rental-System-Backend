import { NextFunction, Response } from "express"
import { RequestCustom } from "../types/express.type"
import { UserPayload } from "../types/user.type"

const roleMiddleware = (roles: string[]): any =>{
    return (req: RequestCustom, res: Response, next: NextFunction)=>{
        const {role} = req.user as UserPayload
        if(!role.includes(role)){
            return res.status(403).json({
                message: 'Không có quyền truy cập'
            })
        }
        next()
    }
}