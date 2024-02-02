var express = require('express')
var router = express.Router();
var countryController = require("./../controller/countryController")
var adminauth = require("./../../../middleware/adminauth");
var auth = require("./../../../middleware/auth");

router.post('/register',[adminauth],countryController.register)
router.post('/getCountries', [auth], countryController.getCountries)

module.exports = router