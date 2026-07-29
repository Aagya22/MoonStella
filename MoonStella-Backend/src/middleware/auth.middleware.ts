import type{ Request, Response,NextFunction} from 'express'
import jwt from 'jsonwebtoken'
import {env} from '../config/env'
import { User } from '../models/user.model'
import { unauthorized } from '../utils/response'

export const protect =async(
    req:Request,
    res:Response,
    next:NextFunction
): Promise<void> => {
    try{
    const authHeader=req.headers.authorization
    if(!authHeader||!authHeader.startsWith('Bearer')){
        unauthorized(res)
        return
    }
    const token=authHeader.split(' ')[1]
    const decoded=jwt.verify(token,env.JWT_SECRET)as {id:string;iat:number;type?:string}
    // Password reset tokens must never authenticate a request
    if(decoded.type==='reset'){
        unauthorized(res)
        return
    }
    const user=await User.findById(decoded.id).select('-passwordHash')
    if(!user){
        unauthorized(res)
        return
    }
    // Checked here as well as at login, since tokens last 30 days
    if(user.isSuspended){
        unauthorized(res,'Your account has been suspended by the administrator. Please contact support.')
        return
    }
    // Reject tokens issued before the last password change
    if(user.passwordChangedAt&&decoded.iat*1000<new Date(user.passwordChangedAt).getTime()){
        unauthorized(res,'Your password was changed. Please log in again.')
        return
    }
    req.user=user as any
    next()
    }catch{
        unauthorized(res)
}
}
export const requireBuyer=(
    req:Request,
    res:Response,
    next: NextFunction
): void=> {
    if(req.user?.role!=='buyer'){
        unauthorized(res)
        return
    }
    next()
}
export const requireSeller=(
    req:Request,
    res:Response,
    next: NextFunction
): void=> {
    if(req.user?.role!=='seller'){
        unauthorized(res)
        return
    }
    next()
}
export const requireAdmin=(
    req:Request,
    res:Response,
    next: NextFunction
): void => {
     if(req.user?.role!=='admin'){
        unauthorized(res)
        return
    }
    next()
}

export const requireUser=(
    req:Request,
    res:Response,
    next:NextFunction
): void=>{
    if (!['buyer','seller'].includes(req.user?.role??'')){
        unauthorized(res)
        return
    }
    next()

} 


