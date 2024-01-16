import express from "express";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import bodyParser from "body-parser";
import {databaseConnection} from './Model/connection_Pg';
import { register,login,logout,getuserdata} from "./Controller/api"; 
import {authenticateToken} from "./Middleware/authentication";



const app =express();
app.use(express.json());
dotenv.config()
declare global {
  namespace Express {
    interface Request {
      useremail?: string ;
}
}}
databaseConnection();

app.use(cookieParser());
app.use(bodyParser.json());

app.post('/register',register);
app.post('/login',login);
app.post('/logout',logout);
app.get('/getuserdata',authenticateToken,getuserdata)

app.get('/',(req:any,res:any)=>{
  res.send("Social media");
})


app.listen(8000,async()=>{
    console.log("Server");
})

