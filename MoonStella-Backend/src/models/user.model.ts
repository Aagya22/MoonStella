import mongoose,{Schema,Document} from "mongoose"
import bcrypt from "bcryptjs"


export interface IUser extends Document{
    firstName: string
    lastName:string
    email:string
    phoneNumber:string
    passwordHash:string
    role:'buyer'| 'seller'|'admin'
    avatar?: string
    location?: string
    following: mongoose.Types.ObjectId[]
    studioName: string | null
    studioSpecialty?: 'custom' | 'ready-made' | 'both' | null
    averageResponseTime?: string | null
    onboarded: boolean
    interests: string[]
    createdAt: Date
    updatedAt: Date
    comparePassword(password: string): Promise<boolean>
}
const UserSchema = new Schema<IUser>(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['buyer', 'seller', 'admin'],
            required: true,
        },
        avatar: {
            type: String,
            default: null,
        },
        location: {
            type: String,
            default: null,
        },
        studioName: { type: String, default: null },
        studioSpecialty: {
            type: String,
            enum: ['custom', 'ready-made', 'both', null],
            default: null,
        },
        averageResponseTime: {
            type: String,
            default: null,
        },
        onboarded: {
            type: Boolean,
            default: false,
        },
        interests: {
            type: [String],
            default: [],
        },
        following:[
            {
                type:Schema.Types.ObjectId,
                ref:'User',
            },
        ],

    },
    { timestamps:true}
) 
UserSchema.methods.comparePassword=async function (password:string):Promise<boolean>{
    return bcrypt.compare(password,this.passwordHash)
}    
export const User= mongoose.model<IUser>('User',UserSchema)
        



    

