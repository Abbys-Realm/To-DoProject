const login= (req,res)=>{
   console.log("user clicked the login")
   res.status(200)
   .json({success:true, message:"hello u tryna login"})
}

const register= (req,res)=>{
   console.log("user clicked to register")
   res.status(200)
   .json({sucess:true, message:"register fn"})

}

module.exports= {
    register, login}