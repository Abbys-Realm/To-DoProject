const bcrypt = require("bcrypt");
const JWT= require("jsonwebtoken");
const pool= require("../Config/db")


const login= async (req,res)=>{
   const  {email,password}= req.body
    try{
      if(!email || !password){
         return res.status(400).json({
            success:false,
            message:"Email and password are required"
         })
      }
     const result= await pool.query(`SELECT * FROM users WHERE email= $1`,[email])
     if(result.rows.length===0){
      return res.status(400).json({
         success:false,
         message:"Invalid Email or Password"
      })}
      const user = result.rows[0]
       
      const validPWD= await bcrypt.compare(password, user.userpassword)

      if(!validPWD){
         return res.status(401).json({
            success:false,
            message:"Invalid email or password"
         })
      }
         const JWTtoken= JWT.sign(
      {
         id:user.id,
         email:user.email
      },
      process.env.JWT_SECRET,
      {
         expiresIn:"7d"
      }
   )
   res.status(200)
   .json({success:true, message:"login successful"})
} 
   catch(error){
    console.log(error);
    res.status(500).json({
        success:false,
        message:"server error"
    })
   }
}

const register= async (req,res)=>{
    try{
   
    const {username, email, password}= req.body
    if(!username||!email||!password){
        return res.status(400).json({success:false, message:"Every field is required"})
    }
    const UserExist= await pool.query(`SELECT id FROM users WHERE email= $1`,[email]);

    if(UserExist.rows.length>0){
      return res.status(400).json({
         success:false,
         message:'Email already exists'
      })
    }
    const emailFormat= /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailFormat.test(email)){
      return res.status(400).json({
         success:false,
         message:"invalid email format"
      })
    }

    if(password.length<8 && password.length>12){
      return res.status(400).json({
         success:false,
         message:"password must be atleast 8 characters and at most 12"
      })
    }
    const hashedpassword= await bcrypt.hash(password,10)
        const result= await pool.query(`INSERT INTO users
            (username,email,userpassword)
            values($1,$2,$3) RETURNING *`,
        [username,email,hashedpassword])
    
     res.status(201).json({
    success: true,
    message: "User Registered Successfully",
    data: { 
      username: result.rows[0].username,
      email: result.rows[0].email,
    }
});
}
   catch(error){
    console.log(error);
    res.status(500).json({
        success:false,
        message:"server error"
    })
   }
}
module.exports= {
    register, login}