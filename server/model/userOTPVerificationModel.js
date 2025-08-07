const mongoose = require("mongoose");
const Schema = mongoose.Schema
const userOTPVerificationSchema = new Schema({
    userId:String,
    otp:String,
    createdAt:Date,
    expiresAt:Date
})

const userOTPVerificatoinModel = new mongoose.model("userOTPVerification",userOTPVerificationSchema)
module.exports = userOTPVerificatoinModel;