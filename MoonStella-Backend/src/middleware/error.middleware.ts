import type{Request,Response,NextFunction} from 'express'

export const errorHandler=(
    err:Error,
    req:Request,
    res:Response,
    next:NextFunction

):void =>{
    console.error(err.stack)
    res.status(500).json({
        success:false,
        message:err.message||'Something went wrong',
        data:null,
    })
}