const jwt = require('jsonwebtoken');

const {TOKEN_KEY,TOKEN_EXPIRY} = process.env;
console.log(TOKEN_KEY,TOKEN_EXPIRY)
const createToken = async (tokenData,tokenKey = TOKEN_KEY,expiresIn = TOKEN_EXPIRY)=>{
    try {
        const token = await jwt.sign(tokenData,tokenKey,{expiresIn,});
        return token;
    } catch (error) {
        throw error
    }
}

module.exports = createToken;