import { Request,Response,RequestHandler} from "express";
import {pool} from "../Model/connection_Pg"
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import lodash from 'lodash';



//Register
export const register = async (req:Request,res: Response)=>{
    const data= req.body
    console.log(data);
    // Validate email pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(data.email)) {
        res.status(400).send('Invalid email format');
        return;
    }
    // Validate password pattern
    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordPattern.test(data.password)) {
        res.status(400).send('Invalid password format');
        return;
    }
    const client  = await pool.connect();
    const existingUser = await client.query('SELECT * FROM users WHERE username = $1', [data.username]);
    if (existingUser.rows.length > 0) {
        res.status(400).send('Username already exists');
        return;
    }
    const existingEmail = await client.query('SELECT * FROM users WHERE email = $1', [data.email]);
    if (existingEmail.rows.length > 0) {
        res.status(400).send('Email already exists');
        return;
    }
    const result =  await client.query('INSERT INTO users(username, password, fullname, email) VALUES($1, $2, $3, $4)', [data.username, data.password, data.fullname, data.email]);

    res.status(200).send('user_registered');
    
}

//Login
export const login:RequestHandler = async(req, res, next) => {
    try{
      const data = req.body ;
      const client  = await pool.connect();
      const existingUser = await client.query('SELECT * FROM users WHERE email = $1', [data.email]);
      // Checking if the email exists in database
      if(!existingUser){
          return res.status(400).json({ok:false,message:"Invalid Credentials"}) ;
      }
      const tableUser = existingUser.rows[0];
      // comapring password entered with database hashed Password
      // const isPasswordMatch = await compareSync(data.password,tableUser.password) ;
      if(data.password!=tableUser.password){
          return res.status(400).json({ok:false,message:"Invalid Credentials"});
      }
    //   // Generating tokens
      const authToken = jwt.sign({useremail : tableUser.email},process.env.JWT_SECRET_KEY||" ",{expiresIn : '30m'}) ;
      const refreshToken = jwt.sign({useremail : tableUser.email},process.env.JWT_REFRESH_SECRET_KEY||" ",{expiresIn : '2h'}) ;
    //   // Saving tokens in cookies
      res.cookie('authToken',authToken,({httpOnly : true})) ;
      res.cookie('refreshToken',refreshToken,({httpOnly:true})) ;
      return res.status(200).json({ok:true,message : "Login Successful",useremail:tableUser.email}) ;
  }
  catch(err){
      next(err);
  }
  };
  //logout
  export const logout:RequestHandler = (req, res, next) => {
    try{
        res.clearCookie('authToken') ;
        res.clearCookie('refreshToken');
        return res.status(200).json({ok:true,message:"User has been logged out"}) ;
    }
    catch(err){
        next(err) ;
    }
  };

//get user's data
export const getuserdata:RequestHandler = async(req:Request, res, next) => {
    try{
        //   const data = req.body;
        //   const client  = await pool.connect();
        //     //find user's info
        //     const resultdata = await client.query('SELECT * FROM users WHERE username = $1', [data.username]);
        //     const myUser = resultdata.rows[0];
        // //send user's information
        // res.status(200).json({client:myUser.rows[0]});
        if(req.useremail?.toString()!=req.params.useremail.toString()){
          return res.status(403).json({ok:true,message:"You have not access to data"}) ;
        }
        const client  = await pool.connect();
        const data:any = await client.query('SELECT * FROM users WHERE user_id = $1', [req.useremail]);
        res.status(200).json({data:data.rows[0]});
        } catch(err:any){
            return res.status(500).json({message : err.message});
        }
      };
