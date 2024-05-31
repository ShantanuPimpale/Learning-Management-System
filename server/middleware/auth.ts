import {Request,Response,NextFunction} from 'express'
import {catchAsyncErrors} from './catchAsyncErrors'
import ErrorHandler from '../utils/Errorhandler'
import jwt from 'jsonwebtoken'
import {redis} from '../utils/redis'
import { IUser } from '../models/user_models'


interface AuthenticatedRequest extends Request {
    user?: IUser;
}
export const IsAutenticated = catchAsyncErrors(async (req: AuthenticatedRequest, res:Response, next: NextFunction)=>{
    const access_token = req.cookies.access_token;
    if(!access_token){
        return next(new ErrorHandler("Please login to acess this resource",400));
    }

    const decoded = await jwt.verify(access_token,process.env.ACCESS_TOKEN as string) as {id:string};

    if(!decoded){
        return next(new ErrorHandler("Access token is not valid",400)); 
    }

    const user=await redis.get(decoded.id);
    
    if(!user){
        return next(new ErrorHandler("User not found",400)); 
    }

    req.user = JSON.parse(user);
    next();
})