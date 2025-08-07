require('../config/database');

//create token
const createToken = require("../../util/createToken");

//jwt token
const jwt = require("jsonwebtoken");

//mongodb user model
const UserModel = require('../model/userModel');

//mongodb userEmailVerification model
const UserVerification = require('../model/userVerificationModel');

//mongodb userOTPVerification model
const UserOTPVerification = require("../model/userOTPVerificationModel")

const bcrypt = require('bcrypt');

//email verification funcions 
const {sendVerificationEmail,sendOTPVerificationEmail} = require("../../util/nodemailer");

module.exports = {    
    /**
     * GET /
     * Show Home page
     */
    homePage: async (req,res)=>{
        res.render('./user/index',{title: 'Sleek Styel - Home',isHome:true,isLocal:false});
    },
    /**
     * GET /products
     * Show product Page
     */
    products: async (req,res)=>{
        res.render('./user/products',{title: 'Sleek Style - Products',isHome:false,isLocal:false});
    },
    /**
     * GET /cart
     * Show My Cart
     */
    cart: async (req,res)=>{
        res.render('./user/shoping-cart',{title: 'Sleek Style - Shoping Cart',isHome:false});
    },
    /**
    * GET /blog
    * Show Blog page
    */
    offers: async (req,res)=>{
       res.render('./user/offer',{title: 'Sleek Style - Blog',isHome:false});
    },
    /**
     * GET /about
     * Show About page
     */
    about: async (req,res)=>{
        res.render('./user/about',{title: 'Sleek Style - About',isHome:false});
    },
    /**
     * GET /contact
     * Show contact page
     */
    contact: async (req,res)=>{
        res.render('./user/contact',{title: 'Sleek Style - Contact',isHome:false});
    },
    /**
     * GET /user-login
     * Show Login page
     */
    userLogin:async (req,res)=>{
        res.render('./user/login',{title: 'Sleek Style - login',isHome:false});
    },
    /**
     * GET /signup
     * Show signup page
     */
    userSignup:async (req,res)=>{
        res.render('./user/signup',{title: 'Sleek Style - signup',isHome:false});
    },
    /** 
     * GET /account-detials 
     * Show ueser profile page
     */
    accountDetails: async(req,res)=>{
        res.render('./user/account-details',{title: 'Sleek Style - signup',isHome:false})
    },
    getProductDetails:async(req,res)=>{
        res.render('./user/product-detail',{title:"Sleek Style - product details",isHome:false});
    },
    getOfferDetails:async(req,res)=>{
        res.render('./user/offer-detail',{title:"Sleek Style - offer details",isHome:false});
    },
    /** 
     * POST /user-signup 
     * post user details
     */
    userSignupPost: async(req,res)=>{
      try {
        const userData = req.body;
        await UserModel.findOne({email:userData.email})
        .then(async (result)=>{
          if(result){
            // res.redirect('/user-signup');
            res.json({
              status:"FAILED",
              message:"user is already exists"
            })
          }else{
           //FOR HASHING THE PASSWORD USE BCRYPT

           const saltRound = 10 //NUMBER OF SALT ROUND FOR BCRYPT
           const hashPassword = await bcrypt.hash(userData.password,saltRound);
           userData.password = hashPassword;
           userData.verified = false;
           await UserModel.insertMany(userData)
           .then(async (result)=>{
            const user = result[0];
            console.log(user)
            res.render("./user/otp",{title: 'Sleek Style - OTP',isHome:false,user:user});
            
            // handle account verification
            // sendVerificationEmail(result[0],res);
            sendOTPVerificationEmail(result[0],res);
           })
           .catch(error=>{
              console.log(error);
              res.json({
                status:"FAILED",
                message:"error occure while saving the user account"
              })
           });
          //  res.redirect('/user-signup');
          }
        })
        .catch(error=>{
          res.status(500)
          .send({message:error.message || "Error Occured while checking the existing user"});
        })
      } catch (error) {
        res.status(500)
        .send({message:error.message || "Error Occured while user sing up"});
      }
    },
     /** 
     * GET /verify/:userId/:uniquestring 
     * user Email verificatoin
     */
     verifyUserEmail:(req,res)=>{
        const {userId,uniqueString} = req.params;
        UserVerification
        .find({userId})
        .then((result)=>{
          console.log(result);
          if(result.length>0){
            //user verification record exist so we proceed
            const {expiresAt} = result[0];
            const hashedUniqueString = result[0].uniqueString;
            
            //checking for expired unique string
            if(expiresAt<Date.now()){

              //recored has expired so we delete it
              UserVerification
              .deleteOne({userId})
              .then((result)=>{
                UserModel
                .deleteOne({_id:userId})
                .then(()=>{
                  let message = "Link has expired, Please sign up again"
                })
                .catch(error=>{
                  console.log(error)
                  let message = 'Clearing user with expired unique string failed'
                  res.redirect(`/verified/error=true&message=${message}`);
                })
              })
              .catch(error=>{
                let message = "An error occure while clearing expired user verification record"
                res.redirect(`/verified/error=true&message=${message}`)
              })

            }else{

              //valid record exists so we validate the user string
              //first compare the hashed unique string
              bcrypt
              .compare(uniqueString,hashedUniqueString)
              .then(result=>{
                if(result){
                //string match
                UserModel
                .updateOne({_id:userId},{verified:true})
                .then(()=>{
                   UserVerification
                   .deleteOne({userId})
                   .then((result)=>{
                      res.json({
                        status:"SUCCESS",
                        message:"successfully verified email"
                      })
                    })
                                  
                    .catch(error=>{
                      console.log(error)
                      let message = "An error occure while finalzing the successfull verificatin of user email" 
                      res.redirect(`/verified/error=true&message=${message}`)
                    })
                    })
                    .catch(error=>{
                      console.log(error);
                      const message = 'An error occured while updating user record to show verified'
                      res.redirect(`/verified/error=true&message=${message}`);
                    })
                }else{
                //existing record but incorrect verification detials passed
                const message = 'invalid verification details passed, check your inbox'
                res.redirect(`/verified/error=true&message=${message}`);
                }
              })
              .catch(error=>{
                console.log(error)
                const message = 'An error occured while comparing the unique string'
                res.redirect(`/verified/error=true&message=${message}`);
              })
            }
          }else{
            //user verification record doesn't exist
           let message = "Account record doesn't exist or has been verified already, Please sign up or login in"
           res.redirect(`/verified/error=true&message=${message}`);
          }
        })
        .catch(error=>{
          console.log(error);
          const message = 'An error occured while checking for existing user verification recored'
          res.redirect(`/verified/error=true&message=${message}`);
        })

    },
     /** 
     * GET /verified 
     * user email id verified
     */
    emailVerified:async(req,res)=>{
      res.json({
        status:"SUCCESS",
        message:"user email id success fully verified and now you can login"
      })
    },
      /** 
     * POST /OTPverification 
     * user otp verification
     */
    OTPVerification:async (req,res)=>{
      try{
        const otp = req.body.otp.join("");
        const {userId} = req.params;
        if(!userId||!otp){
          throw Error("Empty otp details are not allowed");
        }else{
          const userOTPVerificationRecored = await UserOTPVerification
          .find({userId});
          if(userOTPVerificationRecored.length<=0){
            throw new Error(
              "Account recored doesn't exist or has been verified already, please signup or login"
            )
          }else{
            //uer otp recored exists 
            const {expiresAt} = userOTPVerificationRecored[0];
            const hashedOTP = userOTPVerificationRecored[0].otp;

            if(expiresAt<Date.now()){
              //ueser otp recordes has expired
              await UserOTPVerification.deleteMany({userId});
              throw new Error("code has expired. Please requist again");
            }else{
              const validOTP = await bcrypt.compare(otp,hashedOTP);
              if(!validOTP){
                //suplied otp is wrong
                throw new Error("invalid data passed,check your email");
              }else{
                //success 
                await UserModel.updateOne({_id:userId},{verified:true});
                await UserOTPVerification.deleteMany({userId});
                // res.json({
                //     status:"SUCCESS",
                //     message:"User email verified successfully"
                // })
                res.redirect("/")  
              }
            }
          }
        }
      }catch(error){
        res.json({
          status:"FAILED",
          message:error.message
      })
      }
    },
     /** 
     * POST /user-login 
     * user login
     */
     userLoginPost:async(req,res)=>{
       try {
         const {email,password} = req.body;
         const fetchedUser = await UserModel.findOne({email});
         console.log(fetchedUser);
         if(!fetchedUser){
            res.render('./user/login',{title: 'Sleek Style - login',isHome:false})
         }else{
          if(!fetchedUser.verified){
            throw Error("Email hasn't been verified yet, check your inbox");
          }
          const hashedPassword = fetchedUser.password;
          //COMPARE THE HASH PASSWORD FROM THE DATABASE WITH THE PLAIN TEXT
          const isPasswordMatch = await bcrypt.compare(password,hashedPassword);
          if(!isPasswordMatch){
            throw Error("Invalid password entered!");
          }
          const tokenData = {userId:fetchedUser._id,email};
          console.log(tokenData);
          const token = await createToken(tokenData);
          console.log(process.env.TOKEN_EXPIRY)
          res.cookie('jwt',token,{httpOnly:true,maxAge: 1000 * 60 * 60 * 24 * 7});
          req.session.isAuth = true;
          console.log(req.session);
          fetchedUser.token = token
          console.log(fetchedUser);
          res.redirect("/");
         }
       } catch (error) {
        console.log(error);
         res.status(500).send({ message:error.message || "Error Occured" });    
       }
     },
     userLogout:async (req,res)=>{
       res.cookie("jwt","",{maxAge:1});
       res.redirect("/");
     }
    }