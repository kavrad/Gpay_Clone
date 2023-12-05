//import express
const express=require("express");

//define router
const router=express.Router();

const {isLogin} = require("../middlewares/auth");
const {transaction,cashback} = require("../controllers/transaction");

router.post("/send-money",isLogin,transaction)

router.get("/cashback",isLogin,cashback)

module.exports=router