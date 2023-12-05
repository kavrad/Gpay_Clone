const User = require("../models/User");
const bcrypt=require("bcrypt");
const {startSession}=require("mongoose")

//signup controller
exports.signup=async (req,res)=>{

  const session=await startSession()

    try {
      session.startTransaction()

      //extract the user data from req.body
      const {name,email,password,phoneNumber,confirmPassword} = req.body;
      
      //define regex
    let regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
      
    //if any of the feilds are absent return a response
      if(!name || !email || !password || !phoneNumber || !password || !confirmPassword){
        await session.abortTransaction()
        session.endSession()
        return res.status(400).json({
            sucess:false,
            message:"Please fill all the missing fields!!"
        })
      }
      
      //if phoneNumber is not equal to 10 digis return a response
      if(phoneNumber.length > 10 || phoneNumber.length < 10){
        await session.abortTransaction()
        session.endSession()
        return res.status(400).json({
            sucess:false,
            message:"The phone number must have 10 digits"
        })
      }
       
      //find the user already exists
      const phone=await User.findOne({phoneNumber:phoneNumber});
      
      //if exists return a response
      if(phone){
        await session.abortTransaction()
        return res.status(409).json({
            sucess:false,
            message:"You are already a registered user!!"
        })
      }

      console.log(regex.test(password))
      //check wheather password match with the regex
      if(!regex.test(password) || !regex.test(confirmPassword)){
        await session.abortTransaction()
        session.endSession()

        return res.status(400).json({
            sucess:false,
            message:"Please provide a valid password"
        })
      }

       if((password.length !== confirmPassword.length) || (password !== confirmPassword)){
        await session.abortTransaction()
        session.endSession()

          return res.status(400).json({
            sucess:false,
            message:"The password and confirm password does not match!!"
          })
       }
      
       //gash the password using bcrypt
      const hashPassword=await bcrypt.hash(password,10)

      //store the user details in users collection
      const newUser=await User.create({
        name:name,
        email:email,
        password:hashPassword,
        phoneNumber:phoneNumber,

      },{session:session})

      await session.commitTransaction()
      session.endSession()

     res.status(200).json({
        sucess:true,
        data:newUser,
        message:"Sucessfully created the account"
     })

    } catch (error) {
        console.log("Error in creating the user account");
        console.error(error);

        await session.abortTransaction();
        session.endSession();

        res.status(500).json({
            sucess:false,
            message:"Error in creating the user account!!"
        })
    }
}

//login controller
exports.login=async (req,res)=>{
  const session=await startSession()

    try {
      session.startTransaction()

      //extract phoneNuber and password from req.body
        const {phoneNumber,password}=req.body;

        //if any of the fields are absent return response
        if(!phoneNumber || !password){
           await session.abortTransaction();
           session.endSession()

            return res.status(400).json({
                sucess:false,
                message:"Please provide all the missing fields"
            })
        }
        
        //find if user exists or not
        const user=await User.findOne({phoneNumber:phoneNumber});

        if(!user){
          await session.abortTransaction()
          session.endSession()
            return res.status(404).json({
                sucess:false,
                message:"User not found!!"
            })
        }

        const result= await bcrypt.compare(password,user.password)
        console.log("RESULT ->",result)
        if(!result){
          await session.abortTransaction()
          session.endSession()

          return res.status(404).json({
            sucess:false,
            message:"Password is incorrect!!"
          })
        }
        
        if(req.body.wallet){
          await User.findByIdAndUpdate(user._id,{
            $set:{
              loggedFirstTime:true,
              
            },
            $inc:{
              wallet:req.body.wallet,
            }
          },{new:true,session:session})
        }

        console.log("REQ SESSION -> ",req.session)
        req.session.userId=user._id;
        console.log("REQ SESSION:",req.session)
        
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
          sucess:true,
          message:"Sucessfully logged in"
        })
        
    } catch (error) {
      console.log("Error in logging in the user");
      console.log(error);

      await session.abortTransaction();
      session.endSession()

      res.status(500).json({
        sucess:false,
        message:error.message
      })  
    }
}