import {app} from './app'
require('dotenv').config();
import connectDb from './utils/db'
// create server
app.listen(process.env.PORT,()=>{
    console.log(`server is connected to ${process.env.PORT}`);

    connectDb();
})