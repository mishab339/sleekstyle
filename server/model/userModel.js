const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    confirmpassword:{
        type:String,
        required:true
    },
    verified:{
        type:Boolean,
        default:false
    },
    token:String
});

const userModel = new mongoose.model("Users",userSchema);

 module.exports = userModel;