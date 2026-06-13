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
    const decoded=jwt.verify(token,env.JWT_SECRET)as {id:string}
    const user=await User.findById(decoded.id).select('-passwordHash')
    if(!user){
        unauthorized(res)
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


