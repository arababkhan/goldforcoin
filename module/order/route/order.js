var express = require('express')
var router = express.Router();
var orderController = require("./../controller/orderController")
var adminauth = require("./../../../middleware/adminauth");
var auth = require("./../../../middleware/auth");

router.post('/addOrder', [auth], orderController.addOrder)
router.post('/updateOrder', [adminauth], orderController.updateOrder)
router.post('/getOrder', [adminauth], orderController.getOrders)

module.exports = router