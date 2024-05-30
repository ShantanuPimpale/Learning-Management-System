import mongoose from "mongoose";
require("dotenv").config();
const dbUri:string = process.env.DB_URL || '';

const connectDb = async()=>{
    try {
        await mongoose.connect(dbUri).then((Data:any)=>{
            console.log("Database connected");
            
        })
    } catch (error:any) {
        console.log(error.message);
        setTimeout(connectDb,5000);
    }
}

export default connectDb;