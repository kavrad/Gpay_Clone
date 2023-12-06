const mongoose=require("mongoose");

const transactionSchema=new mongoose.Schema({
    amount:{
        type:Number,
        default:0.0
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    reciever:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    payment_at:{
        type:mongoose.Schema.Types.Date,
        default:Date.now()
    }
})

module.exports=mongoose.model("Transaction",transactionSchema);