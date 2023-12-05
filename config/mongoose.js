//import mongoose
const mongoose=require("mongoose");

//import dotenv
require("dotenv").config();

//function that connect server to db via mongoose
exports.dbConnect=async ()=>{
    try {
        const connection=await mongoose.connect(process.env.DB_CONNECTION,{
            useNewUrlParser:true,
            useUnifiedTopology:true
        })
        if(connection) console.log("Sucessfully connected to db")
    } catch (error) {
       console.error("ERROR IN CONNECTING TO DB ->",error)
       process.exit(1); 
    }
}