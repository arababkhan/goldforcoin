var express = require('express')
var router = express.Router();
var productController = require("./../controller/productController")
var adminauth = require("./../../../middleware/adminauth");
var auth = require("./../../../middleware/auth");

router.post('/setPrice', [adminauth],productController.setPrice)
router.post('/getPrice', [auth], productController.getPrice)
router.post('/setWeight', [adminauth], productController.setWeight)
router.post('/getWeight', [auth], productController.getWeight)
router.post('/getWeightObjects', [auth], productController.getWeightObjects)

module.exports = router