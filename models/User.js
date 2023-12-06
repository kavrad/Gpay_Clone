//import mongoose
const mongoose=require("mongoose");

//define user schema
const usersSchema=new mongoose.Schema({
  name:{
    type:String,
    required:true,
    trim:true
  },
  phoneNumber:{
    type:String,
    required:true,
    unique:true,
    maxLength:10
  },
  email:{
    type:String,
    required:true
  },
  password:{
    type:String,
    required:true,
    minLength:6,
    
  },
  loggedFirstTime:{
    type:Boolean,
    default:false
  },
  wallet:{
    type:Number,
    default:0.0
  },
  recentTransaction:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Transaction"
  }
})




module.exports=mongoose.model("User",usersSchema);
