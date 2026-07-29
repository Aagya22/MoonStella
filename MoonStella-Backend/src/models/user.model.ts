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
    bio?: string | null
    following: mongoose.Types.ObjectId[]
    savedPosts: mongoose.Types.ObjectId[]
    studioName: string | null
    studioSpecialty?: 'custom' | 'ready-made' | 'both' | null
    averageResponseTime?: string | null
    onboarded: boolean
    interests: string[]
    isApproved: boolean
    isSuspended: boolean
    passwordChangedAt?: Date | null
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
        bio: {
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
        isApproved: {
            type: Boolean,
            default: true,
        },
        isSuspended: {
            type: Boolean,
            default: false,
        },
        // Tokens issued before this are rejected
        passwordChangedAt: {
            type: Date,
            default: null,
        },
        following:[
            {
                type:Schema.Types.ObjectId,
                ref:'User',
            },
        ],
        savedPosts: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Post',
            },
        ],

    },
    { timestamps:true}
) 
UserSchema.methods.comparePassword=async function (password:string):Promise<boolean>{
    return bcrypt.compare(password,this.passwordHash)
}    
export const User= mongoose.model<IUser>('User',UserSchema)
        



    

