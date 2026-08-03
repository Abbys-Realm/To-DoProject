const JWT= require("jsonwebtoken");

//Handles authorization for a user task

const authMiddleware= (req,res,next)=>{
  //Assigning a variable to a request header that handles authorization 
  //via jwtoken
  const authHeader=req.headers.authorization;
  
  //if no token provided
  if(!authHeader){
    return res.status(401).json({
        success:false,
        message:"No token provided"
    })
  }
  //check format of token
  if(!authHeader.startsWith("Bearer ")){
    return res.status(401).json({
        success:false,
        message:"Invalid token format"
    })
  }
  try{
    //.verify(): check token validity, signed with the correct secret key and its expiration
    //if token is valid, it decodes the token and return data
  const decoded=JWT.verify(token, process.env.JWT_SECRET);
 next();}
 catch(error){
    console.log("JWT error: ", token)
   return res.status(401).json({
    success:false,
    message:"invalid token"
   })
 }
}

module.exports= authMiddleware; 