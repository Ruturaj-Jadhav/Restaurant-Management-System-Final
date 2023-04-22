const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const localStorage = require('local-storage');

const JWT_SECRET = process.env.JWT_SECRET

var router = express.Router();

const Usermodel = require('../../models/user.model');
  
  router.get('/viewmenu', async (req , res)=>{

    const token = localStorage.get('jwt');

    jwt.verify( token, JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        // The token is invalid or has expired
        console.log(err);
        res.sendStatus(401);
      } else {
        // The token is valid
        const username = decodedToken.username;
        var items = await Usermodel.findOne({username : username} , {'_id' : 0 , 'menu' : 1})
        res.render("menu" , {dishs : items.menu , prices : items.menu})
      }
    });
  
  })

  module.exports = router;
  