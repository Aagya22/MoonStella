import type{Response} from 'express'

export const ok= (res:Response,data:unknown,message='Success')=>
    res.status(200).json({success:true,message,data})
export const created= (res:Response,data:unknown,message='Created')=>
    res.status(201).json({success:true,message,data})
export const badRequest= (res:Response,message='Bad request')=>
    res.status(400).json({success:false,message,data:null})
export const unauthorized= (res:Response,message='Unauthorized')=>
    res.status(401).json({success:false,message,data:null})
export const notFound=(res:Response,message='Not found')=>
    res.status(404).json({success:false,message,data:null})
export const serverError= (res:Response,error:unknown,)=>{
    console.error(error)
return res.status(500).json({success:false,message:'sever error',data:null})}

    