import express, { NextFunction, Response, Request } from 'express'
export const app = express();
import cors from 'cors'
import cookieParser from 'cookie-parser'
require('dotenv').config();
import {ErrorMiddleware} from './middleware/error'
import userRouter from './routes/user_routes'

// body parser
app.use(express.json({ limit: "50mb" }));

// cookie parser
app.use(cookieParser());

// cors
app.use(cors({
    origin: process.env.ORIGIN,
}));

// routes
app.use('/api/v1',userRouter)

// Testing api
app.get('/test', (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ success: true, msg: "Api working" })
});

// unknown rout
app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    err.statusCode = 400;
    next(err);

});

app.use(ErrorMiddleware);