const jwt = require('jsonwebtoken');
const User = require("./../server/model/userModel")
// const router = require('../routes');

const {TOKEN_KEY} = process.env;

const userAuth = async (req,res,next)=>{
    const token = req.body.token || req.query.token || req.headers["x-access-token"] || req.cookies.jwt;

    //check for provided token
    if(!token){
        return res.status(403).send("An authentication token is required");
    }

    //verify token
    try {
        const decodedToken = await jwt.verify(token,TOKEN_KEY);
        req.currentUser = decodedToken
    } catch (error) {
        return res.status(401).send("Invalid Token provided");
    }

    //proceed with request
    return next();
};
const checkUser = async (req,res,next)=>{
    const token = req.body.token || req.query.token || req.headers["x-access-token"] || req.cookies.jwt;
    if(token){
        jwt.verify(token,TOKEN_KEY,async(error,decodedToken)=>{
            if(error){
                console.log(error.message);
                res.locals.user = null;
                next();
            }else{
                console.log(decodedToken);
                let user =await User.findById(decodedToken.userId);
                console.log(user)
                res.locals.user = user.lastname.toUpperCase();
                next();
            }
        })
    }else{
        res.locals.user = null;
        next();
    }
};
module.exports = {userAuth,checkUser}