import mongoose,{Document,Model,Schema} from "mongoose";
import bcrypt from "bcryptjs";
require ('dotenv').config();
import jwt from "jsonwebtoken";
const emailRegexPattern: RegExp =/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export interface IUser extends Document{
    name:string;
    email:string;
    password:string;
    avatar:{
        public_id:string;
        url:string;
    },
    role:string;
    isVerified:boolean;
    courses:Array<{courseId:string}>;
    comparedPassword:(password:string)=>Promise<boolean>;
    SignAccessToken:()=>string;
    SignRefreshToken:()=>string;
}
const userSchema:Schema<IUser>=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please Enter Your Name"],
    },
    email:{
        type:String,
        required:[true,"Please Enter Your Email"],
            validator:{
                validator:function(value:string){
                    return emailRegexPattern.test(value);
                },
                message:"please enter valid email",
            },
            unique:true,
        },
        password:{
            type:String,
            required:[true,"Please Enter Your password"],
            minilength:[6,"Password must be at least 6 characters"],
            select:false,
        },
        avatar:{
            public_id:String,
            url:String,
        },
        role:{
            type:String,
            default:"user"
        },
        isVerified:{
            type:Boolean,
            default:false,
        },
        courses:[
            {
                courseId:String,
            }
        ]
    },{timestamps:true});

    //Hash Password before saving
    userSchema.pre<IUser>('save',async function(next){
        if(!this.isModified('password')){
            next();
        }
        this.password=await bcrypt.hash(this.password,10);
        next();
    })
    //sign access token(after user sign in create token)
    userSchema.methods.SignAccessToken=function(){
        return jwt.sign({id:this.__id},process.env.ACCESS_TOKEN||"");
    }

    //sign refresh token
    userSchema.methods.SignRefreshToken=function(){
        return jwt.sign({id:this.__id},process.env.REFRESH_TOKEN||"");
    }

    //compare password
    userSchema.methods.comparedPassword=async function(enteredPassword:string):Promise<boolean>{
        return await bcrypt.compare(enteredPassword,this.password);
    };
    const userModel:Model<IUser>=mongoose.model("User",userSchema);
    export default userModel;