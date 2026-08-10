//assign variables to a module
const bcrypt = require("bcrypt");
const JWT= require("jsonwebtoken");
const pool= require("../Config/db")


//user login
const login= async (req,res)=>{
   //required body is email and pwd
   const  {email,password}= req.body
    try{
      //requirement of email and pwd from the user
      if(!email || !password){
         return res.status(400).json({
            success:false,
            message:"Email and password are required"
         })
      }
      //A query to fetch a user based on a given email
     const result= await pool.query(`SELECT * FROM users WHERE email= $1`,[email])
     //if theres no row returned
     if(result.rows.length===0){
      return res.status(400).json({
         success:false,
         message:"Invalid Email or Password"
      })}
      const user = result.rows[0]
        
      //encrypting user's password
      const validPWD= await bcrypt.compare(password, user.userpassword)
      //checking validity
      if(!validPWD){
         return res.status(401).json({
            success:false,
            message:"Invalid email or password"
         })
      }
      //a token for user to track logging in
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
   //displaying user's token and success message when they login:
           console.log(req.user);
   res.status(200)
   .json({success:true, message:"login successful",
         JWTtoken
   })
   
} 
   catch(error){
    console.log(error);
    res.status(500).json({
        success:false,
        message:"server error"
    })
   }
}

//user register
const register= async (req,res)=>{
    try{
    //requirement for new user registeration
    const {username, email, password}= req.body
   //ensure each requirement is included
    if(!username||!email||!password){
        return res.status(400).json({success:false, message:"Every field is required"})
    }
    //A query that matches the provided email to the db and check if user exist
    const UserExist= await pool.query(`SELECT id FROM users WHERE email= $1`,[email]);
   
    //if the query return any rows it means the user exist already
    if(UserExist.rows.length>0){
      return res.status(400).json({
         success:false,
         message:'Email already exists'
      })
    }
     //A variable to check a valid format for an email
    const emailFormat= /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   //Checking Validity
    if(!emailFormat.test(email)){
      return res.status(400).json({
         success:false,
         message:"invalid email format"
      })
    }
   //Check validity password
    if(password.length<8 && password.length>12){
      return res.status(400).json({
         success:false,
         message:"password must be atleast 8 characters and at most 12"
      })
    }
    //encrypting the pwd before returning into the db
    const hashedpassword= await bcrypt.hash(password,10)
    //A query that saves the provided info to the db
        const result= await pool.query(`INSERT INTO users
            (username,email,userpassword)
            values($1,$2,$3) RETURNING *`,
        [username,email,hashedpassword])
    //save the registered user and return its username and email
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
//export the modules to be accessed in other files
module.exports= {
    register, login}