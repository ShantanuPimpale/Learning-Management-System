import { NextFunction, Request, Response } from "express";

export const catchAsyncErrors = (theFunc:any)=>(res:Response,req:Request,next:NextFunction)=>{
    Promise.resolve(theFunc(req,res,next)).catch(next);
}