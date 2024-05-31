import { Request, Response, NextFunction } from 'express';
import userModel, { IUser } from "../models/user_models";
import ErrorHandler from '../utils/Errorhandler';
import { catchAsyncErrors } from '../middleware/catchAsyncErrors';
import jwt, { Secret } from 'jsonwebtoken'
require("dotenv").config();
import ejs from 'ejs'
import path from 'path';
import sendMail from '../utils/sendEmail';
import {sendToken} from '../utils/jwt'

// register user
interface IRegistrationBody {
    name: string;
    email: string;
    password: string;
    avatar?: string
}
export const registrationUser = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;
        const IsEmaiExist = await userModel.findOne({ email });
        if (IsEmaiExist) {
            return next(new ErrorHandler("Email already exist", 400))
        };

        const user: IRegistrationBody = {
            name,
            email,
            password
        };

        const activationToken = createActivationToken(user);
        const activationCode = activationToken.activationCode;
        const data = { name: user.name, activationCode };
        const html = await ejs.renderFile(path.join(__dirname, "../mails/activation_mail.ejs"), data);

        try {
            await sendMail({
                email: user.email,
                subject: "Account Activation",
                template: "activation_mail.ejs",
                data,
            });

            res.status(201).json({
                success: true,
                message: `Please check your emails: ${user.email} to activate your account`,
                activationToken: activationToken.token,
            })
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400))
        }

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }

})

interface IActivationToken {
    token: string;
    activationCode: string;
}

export const createActivationToken = (user: IRegistrationBody): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const token = jwt.sign(
        { user, activationCode },
        process.env.ACTIVATION_SECRET as Secret,
        { expiresIn: "5m" }
    );
    return { token, activationCode }
}

// Activate User

interface IActivationRequest {
    activation_token: string;
    activation_code: string;
}

export const activateuser = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { activation_token, activation_code } = req.body as IActivationRequest;

        const newUser: { user: IUser, activationCode: string } = jwt.verify(
            activation_token,
            process.env.ACTIVATION_SECRET as string
        ) as { user: IUser; activationCode: string };

        if (newUser.activationCode != activation_code) {
            return next(new ErrorHandler("Invalid Activation Code", 400))
        }

        const { name, email, password } = newUser.user;
        const existUser = await userModel.findOne({ email });
        if (existUser) {
            return next(new ErrorHandler("Email Already Exist", 400))
        }

        const user = await userModel.create({
            name,
            email,
            password
        });
        res.status(201).json({
            success: true,

        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

//login User
interface ILoginRequest{
    email:string;
    password:string;
  }
  export const loginUser=catchAsyncErrors(async(req: Request, res:Response, next: NextFunction)=>{
    try{
        const {email,password}=req.body as ILoginRequest;
        if(!email || !password){
          return next(new ErrorHandler("Please enter Email and Password", 400));
        }
        const user=await userModel.findOne({email}).select("+password");
        if(!user)
        {
          return next(new ErrorHandler("Invalid Email or Password!!", 400));
        }
        const isPasswordMatch=await user.comparedPassword(password);
        if(!isPasswordMatch)
        {
          return next(new ErrorHandler("Invalid Email or Password!!", 400));
        }
        sendToken(user,200,res);
    }
    catch(error:any)
    {
      return next(new ErrorHandler(error.message, 400));
    }
  })
  
  //logoutuser
  export const logoutUser=catchAsyncErrors(
    async (req: Request, res:Response, next: NextFunction)=>{
      try{
        res.cookie("access_token","",{maxAge:1});
        res.cookie("refresh_token","",{maxAge:1});
        res.status(200).json({
          success:true,
          message:"Logged Out Successfully!!",
        });
      }
      catch(error:any){
        return next(new ErrorHandler(error.message, 400));
      }
    }
  );