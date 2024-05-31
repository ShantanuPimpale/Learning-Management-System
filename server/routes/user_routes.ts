import express from 'express';
import { activateuser, loginUser, logoutUser, registrationUser } from '../controllers/user_controller'; 
import {IsAutenticated} from '../middleware/auth'
const userRouter = express.Router();

userRouter.post('/registration', registrationUser);

userRouter.post('/activateUser', activateuser);

userRouter.post('/loginUser', loginUser);

userRouter.get('/logoutUser',IsAutenticated ,logoutUser);

export default userRouter;