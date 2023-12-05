//import user model
const User = require("../models/User")

//isLogin middleware
exports.isLogin=async (req,res,next)=>{
    try {
        
       console.log("SESSION CREATED",req.session)
       const {userId}=req.session;

       if(!userId){
        return res.status(400).json({
            success:false,
            message:"User not registered!!"
        })
       }
       req.user=userId
       next();
       
    } catch (error) {
        console.log("Error in authentiating the user")
        console.error("ERROR ->",error)
        res.status(500).json({
            success:false,
            message:"Error in authenticating the user"
        })
    }
}
