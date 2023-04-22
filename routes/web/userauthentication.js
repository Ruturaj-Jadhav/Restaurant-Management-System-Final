const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const localStorage = require('local-storage')
var username;
var router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET

const Usermodel = require('../../models/user.model');

router.get('/' , (req , res)=>{
    res.sendFile('D:/Web Development/Backend/NODE-RAZORPAY-MAIN/public/register.html');
    
})

router.get('/login' , (req , res)=>{
  res.sendFile('D:/Web Development/Backend/NODE-RAZORPAY-MAIN/public/login.html');
})

router.post('/register' , async (req , res)=>{
  const username = req.body.username;
  const textpassword = req.body.password;


  const password =await bcrypt.hash(textpassword , 10);

  try {
    const response = await Usermodel.create ({
      username : username ,
      password : password
    })

    console.log("User Created successfully : " , response )
  }
  catch(error){
    if(error.code === 11000){
      return res.json({status : "error" , error : "Username already in use"})
    }

    throw error

  }

  res.json({status : 'ok'})
})


router.post('/login' , async (req , res)=>{
  username = req.body.username
  const password = req.body.password

  const user = await Usermodel.findOne({username}).lean()

  if(!user){
    return res.json({status : "error" , error : "User not found"})
  }

  data =  await Usermodel.findOne({username} , {'_id' : 0 , 'menu' : 1, 'dish' : 1})



  if(await bcrypt.compare(password , user.password)) {


    const token = jwt.sign(
    {
       id : user._id ,
       username : user.username
    },
    JWT_SECRET,
    {expiresIn : '2h'}
    )

    console.log(token);

    localStorage.set('jwt', token);

   res.render("restaurantview" )


  }
  else{
    res.json({status : "error" , error : "Invalid Password"})
  }



})

router.post('/menu' , async (req,res)=>{
  var item =  req.body.dishh
  var price = req.body.price
  const user = await Usermodel.findOne({username}).lean()


  

 await Usermodel.findOneAndUpdate({username : username} , {
    $push : {
      menu : {
        dish : item.toUpperCase() ,
        price : price
      }
    }
  })

  // const data = fs.readFileSync(user)
  //dataa =  await Usermodel.findOne({username} , {'_id' : 0 , 'menu' : 1})

  res.render("restaurantview" )


  
})

module.exports = router;

