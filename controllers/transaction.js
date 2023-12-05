//import user model
const User = require("../models/User");
const {startSession}=require("mongoose")

//transaction controller
exports.transaction=async (req,res)=>{
    const session=await startSession()
    try {
        session.startTransaction()
        //initialize the minimum amount
        let minAmount=100;

        //extract amount and recipient from req.body
        const {amount,recipient}=req.body;
        console.log("REQ USER :",req.user)

        //if any of the feilds are absent return response
        if(!amount || !recipient){
            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                success:false,
                message:"Please fill all the fields"
            })
        }

        //check wheather the recipient phone number is equal to 10 digits
        if(recipient.length <10 || recipient.length >10) {
            await session.abortTransaction();
            session.endSession()

            return res.status(400).json({
                success:false,
                message:"The phone number must have 10 digits!!"
            })
        }
        
        //check the recipient account exists or not
        const recipientUser=await User.findOne({phoneNumber:recipient});
        
        //if not found return a response
        if(!recipientUser){
            await session.abortTransaction();
            session.endSession();

            return res.status(404).json({
                success:false,
                message:'User not found!!'
            })
        }
        
        //find the sender
        const sender=await User.findById(req.user);

        //check if the sender has balance less than minAount or sebder balance is less than recipients amount
        if((sender.wallet < minAmount) || (sender.wallet < amount)){
            await session.abortTransaction();
            session.endSession()

            return res.status(400).json({
                success:false,
                message:"Insufficient balance!!"
            })
        }
        
        //subtract the amount from the sender
        sender.wallet=sender.wallet-amount;

        //Also insert the reciever id in reciver array
        if(!sender.reciever.includes(recipientUser._id)) sender.reciever.push(recipientUser._id)
        
        await sender.save();
        
        //add the amount to the recipient account
        recipientUser.wallet = recipientUser.wallet + amount
        
        //also insert the sender id in reciever array
        if(!recipientUser.sender.includes(sender._id)) recipientUser.sender.push(sender._id)
       
        await recipientUser.save();

        console.log("SENDER WALLET -> ",sender.wallet);
        console.log("RECIEVER WALLET",recipientUser.wallet)
        
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success:true,
            message:"Transaction sucessfull!!"
        })

    } catch (error) {
        console.log("Error in performing the transaction");
        console.error(error);

        await session.abortTransaction();
        session.endSession()

        res.status(500).json({
            success:false,
            message:"Something went wrong!!"        
        })
    }
}

//cashback controller
exports.cashback=async (req,res)=>{
    
    try {
        //find if sender exists or not
      const sender=await User.findById(req.user)

      //find if reciever exists or not
      const reciever=await User.findById(sender.reciever.at(-1))
      console.log("SENDER",sender)
      console.log("RECIEVER",reciever)

      const amount=sender.wallet
      
      //if amount is not a multiple of 500 return a response
      if(amount % 500 === 0){
        return res.status(200).json({
            success:true,
            message:"Better Luck next time!!"
        })
      }
      
      //if amount is less than 1000 provide 5% cashback
      if(amount < 1000){
        let cashback=reciever.wallet - (5/100*reciever.wallet) 
        console.log("CASHBACK",cashback)
        reciever.wallet=cashback;
        await reciever.save()
        console.log("RECUEVER WALLET",reciever)

        const addToSender=sender.wallet+cashback
        sender.wallet=addToSender
        await sender.save()

        return res.json({
            message:"5% cashback",
            cashbackDetails:sender,
            currentBalance:sender.wallet
        })
      }
       
      //if amount is greater than 500 provide 2% cashback
      if(amount > 1000){
        let cashback=reciever.wallet - (2/100*reciever.wallet);
        reciever.wallet=cashback
        await reciever.save();

        const addToSender=sender.wallet+cashback
        sender.wallet=addToSender
        await sender.save()

        return res.json({
            message:"2% cahback",
            cashbackDetails:sender,
            currentBalance:sender.wallet
        })
      }

      //other return no such cashbacks as response
      res.json({
        message:"Sorry no cashbacks this time!!"
      })

    } catch (error) {
        console.log("Error in sending the cashback to the sender")
        console.error(error)
        res.status(500).json({
            success:false,
            message:"Failed to provide the cashback"
        })
    }
}