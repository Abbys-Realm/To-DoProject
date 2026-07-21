const users = require("../DATA/users")

const login= (req,res)=>{
   console.log("user clicked the login")

   const  {email,password}= req.body

   const usersemail= users.find((user)=>{
    return user.email===email
   })
   
   if(!usersemail){
    return res.status(404).json({success:false, message:"email DNE"})
   }
   if(usersemail.password !== password){
    return res.status(401).
    json({success:false,
         message:"incorrect pwd"})
   }

   res.status(200)
   .json({success:true, message:"hello u tryna login"})
}

const register= (req,res)=>{
    const {username, email, password}= req.body
    if(!username||!email||!password){
        return res.status(400).json({success:false, message:"every field is required"})
    }
     const userEmail= users.find((user)=>{
        return user.email===email})

     if(userEmail){
        return res.status(400).json({success:false, message:"email alr exist fn"})
     }
     const newUser= {
    username: username,
    email: email,
    password: password
   }
   users.push(newUser)

   console.log("user clicked to register")
   res.status(200)
   .json({success:true, message:"registeredd"})

}

module.exports= {
    register, login}