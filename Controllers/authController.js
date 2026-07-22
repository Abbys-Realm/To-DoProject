const bcrypt = require("bcrypt");
const JWT= require("jsonwebtoken");
const users = require("../DATA/users")

const login= async (req,res)=>{
   console.log("user clicked the login")

   const  {email,password}= req.body

   const user= users.find((user)=>{
    return user.email===email
   })
   if(!user){
    return res.status(404).json({success:false, message:"email DNE"})
   }
  // console.log("password from req.body:", password);
//console.log("user:", user);
//console.log("stored password:", user?.password);
   const matchedPassword= await bcrypt.compare(password, user.password)
   
   if(!matchedPassword){
    return res.status(401).
    json({success:false,
         message:"incorrect pwd"})
   }
   const JWTtoken= JWT.sign(
      {
         id:user.id,
         email:user.email
      },
      process.env.JWT_SECRET,
      {
         expiresIn:"1h"
      }
   )
   res.status(200)
   .json({success:true, message:"login successful",JWTtoken})
}

const register= async (req,res)=>{
    const {username, email, password}= req.body
    if(!username||!email||!password){
        return res.status(400).json({success:false, message:"every field is required"})
    }
     const user= users.find((user)=>{
        return user.email===email})

     if(user){
        return res.status(400).json({success:false, message:"email alr exist fn"})
     }
     const hashedPassword= await bcrypt.hash(password,10);
     const newUser= {
      id: users.length+1,
    username: username,
    email: email,
    password: hashedPassword
   }
   users.push(newUser)

   console.log("user clicked to register")
   console.log(users);
   res.status(200)
   .json({success:true, message:"user registeredd"})

}

module.exports= {
    register, login}