const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const {userAuth,checkUser} = require("../../middleware/authMiddleware");
const {check,validationResult} = require("express-validator");

// router.get("*",checkUser);
//web pages routes
router.get('/',userController.homePage);
router.get('/products',userController.products);   
router.get('/cart',userController.cart);
router.get('/offer',userController.offers);
router.get('/about',userController.about);
router.get('/contact',userController.contact);
router.get('/user-login',userController.userLogin);
router.get('/user-signup',userController.userSignup);
router.get('/account-details',userController.accountDetails);
router.get('/super-coin',userController.superCoins);
router.get('/orders',userController.getOrders);
router.get("/wish-list",userController.getWhishList);
router.get("/coupons",userController.getCoupons);
router.get("/address",userController.getAddresses);
router.get("/notifications",userController.getNotifications);
router.get("/product-details",userController.getProductDetails);
router.get("/offer-details",userController.getOfferDetails);

//user authentication routes
router.post('/user-signup',userController.userSignupPost);
router.post('/user-login',userController.userLoginPost);
router.get('/verify/:userId/:uniqueString',userController.verifyUserEmail)
router.get('/verified',userController.emailVerified);
router.post("/verifyOTP/:userId",userController.OTPVerification);
router.get('/logout',userController.userLogout)


module.exports = router;