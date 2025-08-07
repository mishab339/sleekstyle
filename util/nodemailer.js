//env variable
require("dotenv").config();

//emial handlesr
const nodemailer = require("nodemailer");

//unique string
const {v4:uuidv4} = require('uuid');

//hashing variable
const bcrypt = require("bcrypt");

//mongodb user verification model
const UserVerification = require("../server/model/userVerificationModel");

//mongodb user otp verification model
const UserOTPVerification = require("../server/model/userOTPVerificationModel");

//nodemailer stuff
const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.AUTH_EMAIL,
        pass:process.env.AUTH_PASS
    }
})

transporter.verify((error,success)=>{
    if(error){
        console.log(error);
    }else{
        console.log("Ready for messages");
        console.log(success);
    }
})

//send verification email
module.exports = {
    sendVerificationEmail:({_id,email},res)=>{

        //uri to be use in the email
        const currentUri = "http://localhost:3000/"
        const uniqueString = uuidv4() + _id;

        //mail options
        const mailOptions = {
            from:process.env.AUTH_EMAIL,
            to:email,
            subject:"verify your email",
            html:`<p>Verify your email address to complete the signup and login into your account,</p><p>This link <b> expires in 6 hours</b>.</p>
                 <p>Press <a href=${currentUri + "verify/" + _id + "/" + uniqueString}>here</a> to proceed. </p>`,
          }
    
        //hash the unique string
        const saltRound = 10;
        bcrypt
        .hash(uniqueString,saltRound)
        .then((hashedUniqueString)=>{
            //set value in userverification collection
            const newVerification = new UserVerification({
                userId:_id,
                uniqueString:hashedUniqueString,
                createdAt:Date.now(),
                expiresAt:Date.now() + 21600000,
            })
            newVerification
            .save()
            .then((result)=>{
                transporter.sendMail(mailOptions)
                .then((result)=>{
                    
                    //email send and verification recored saved
                    res.json({
                        status:"PEINDING",
                        message:"verification email send"
                    })
                })
                .catch(error=>{
                    console.log(error)
                    res.json({
                        status:"FAILED",
                        message:"verification of email failed"
                    })
                })
            })
            .catch(error=>{
                console.log(error)
                res.json({
                    status:"FAILED",
                    message:"couldn't save the verification email data!"
                })
            })
        })
        .catch(error=>{
            console.log(error);
            res.json({
                status:"FAILED",
                message:"An error occured while hashing the email data"
            })
        })
    },
    //send otp verification email
    sendOTPVerificationEmail:async ({_id,email},res)=>{
        try {
            const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
            console.log(otp);
            //mail option
            const mailOptions = {
                from:process.env.AUTH_EMAIL,
                to:email,
                subject:"Verify your email",
                html:`<p> Enter ${otp} in the app to verify your email address and complete the signup
                 </p><p>This code <b>expires in 1 houre</b>,</p>`,
            }
            console.log(mailOptions);
            //hash the otp
            const saltRound = 10;
            const hashedOTP = await bcrypt.hash(otp,saltRound);
            const newOTPVerification =await new UserOTPVerification({
                userId:_id,
                otp:hashedOTP,
                createdAt:Date.now(),
                expiresAt:Date.now() + 3600000,
            })
            console.log(newOTPVerification);
            await newOTPVerification.save();
            await transporter.sendMail(mailOptions);
            // res.json({
            //     status:"SUCCESS",
            //     message:"Verification otp email send",
            //     data:{
            //         userId:_id,
            //         email
            //     }
            // })
        } catch (error) {
            res.json({
                status:"FAILED",
                message:error.message
            })
        }
    }
}


