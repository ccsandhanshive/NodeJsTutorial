const express=require("express");
const bodyParser=require("body-parser");
const cors=require("cors");
const app=express();
const { mongoose} = require("mongoose");
var corsUrl={
    origin:"http://localhost:3000"
};
app.use(cors(corsUrl));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

const db=require("./app/models");
//Movie Model
const movieModel = require("./app/models/movie.model.js");

db.mongoose.connect(db.url,{useNewUrlParser: true,useUnifiedTopology: true,useFindAndModify: false }
    ).then(()=>{
    console.log("connected to database")
}).catch(err=>{
    console.log("cannot connect to database");
    process.exit();
})
app.get("/",(req,res)=>{
    res.json({"message":"This is welcome from app"});
})
require("./app/routes/movie.routes.js")(app);



const PORT=process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log(`server is running port no ${PORT}`);
})