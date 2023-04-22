const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema(
    {
    username : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String ,
        required : true
    },
    menu : [
        {
            dish :{
                type : String
            },
            price : {
                type : Number
            }
        }
    ]
}
)

const Usermodel = mongoose.model('Usermodel', UserSchema);

module.exports = Usermodel;