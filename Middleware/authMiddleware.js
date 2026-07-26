const JWT= require("jsonwebtoken");
   

const authMiddleware= (req,res,next)=>{
  const authHeader=req.headers.authorization;
  
  if(!authHeader){
    return res.status(401).json({
        success:false,
        message:"No token provided"
    })
  }
  if(!authHeader.startsWith("Bearer ")){
    return res.status(401).json({
        success:false,
        message:"Invalid token format"
    })
  }
  const token= authHeader.split(" ")[1];
  try{
  const decoded=JWT.verify(token, process.env.JWT_SECRET);
  console.log(decoded)
  req.user=decoded;
  //console.log(token)
 //console.log("authorization header: ",authHeader);
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