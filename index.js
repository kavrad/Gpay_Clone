//import express
const express=require("express");

//import express-session
const session=require("express-session");

//function to connect server to db via mongoose
const {dbConnect}=require("./config/mongoose");

//import auth routes
const authRoutes=require("./routes/auth");

//import transactionRoutes
const transactionRoutes=require("./routes/transaction")

const MongoDBStore=require("connect-mongodb-session")(session);

require("dotenv").config()

//define port
const port=process.env.PORT || 5000

//initialize the server
const app=express();

dbConnect();

//define store
const store=new MongoDBStore({
    uri:process.env.DB_CONNECTION,
    collection:"mySessions"
})

//middleware to parse req.body
app.use(express.json());

//middleware to create session
app.use(session({
    secret:process.env.SECRETKEY,
    name:"token",
    resave:false,
    saveUninitialized:true,
    store:store
}))

app.use("/api/v2/auth",authRoutes)

app.use("/api/v2/transaction",transactionRoutes)

app.get("/",(req,res)=>{
    console.log("SESSION REQ-> ",req.session)
    res.send("Hello")
})

//listening the app on a particular port
app.listen(port,(err)=>{
    if(err){
        throw err
    }
    console.log(`Server is running on port ${port}`)
})