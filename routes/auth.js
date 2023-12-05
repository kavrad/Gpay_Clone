//import express
const express=require("express");

//define router
const router=express.Router();

//import controllers
const {signup,login}=require("../controllers/auth");

//post method for signup
router.post("/signup",signup);

//post method for login
router.post("/login",login)

module.exports=router;