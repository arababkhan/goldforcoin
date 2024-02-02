const express = require('express')
const app = express()
var bodyParser = require('body-parser');
const dotenv = require('dotenv');

var user = require("./module/user/route/user")
var country = require('./module/countries/route/country')
var product = require('./module/products/route/product')
var order = require('./module/order/route/order')

var mongoose = require('mongoose');
var cors = require('cors');

global.__basedir = __dirname;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())
dotenv.config()

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var db = mongoose.connection;
db.on('connected', () => console.log('Connected'));
db.on('error', () => console.log('Connection failed'));
if(!db) {
   console.log("Error connecting db")
} else {
   console.log("Db connected successfully")
}

/*
* Below lines used to define route for the api services
*/
app.get('/', (req, res) => res.send('Welcome to Cryptotrades API'))
app.use('/api/user', user)
app.use('/api/country', country)
app.use('/api/product', product)
app.use('/api/order', order)

/*
* Below lines used to handle invalid api calls
*/
app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
})
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.listen(process.env.PORT, () => console.log(`Cryptotrades app listening on port ${process.env.PORT}!`))