if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const express = require('express');
const path = require('path');
const session = require("express-session");
var MongoDBStore = require('connect-mongodb-session')(session);
const {v4:uuidv4} = require('uuid');
const expressLayout = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');

const app = express();

const {MONGODB_URI} = process.env
app.set('view engine','ejs');
app.set('layout','layouts/layout');

app.use(express.urlencoded({extended:true}));
app.use(expressLayout)
app.use(express.static('public'));
app.use(cookieParser());

//for accepting port from data
const bodyParser = express.json
app.use(bodyParser());

var store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'mySessions'
});

app.use(session({
    secret:uuidv4(),
    cookie:{
        maxAge: 1000 * 60 * 60 * 24 * 7
    },
    store:store,
    resave:false,
    saveUninitialized:false
}));

//routes
const userRouter = require('./server/routes/userRoutes.js');

app.use('/',userRouter);

app.listen(process.env.PORT||3000,()=>{
    console.log(`server started on port number ${process.env.PORT}`);
});