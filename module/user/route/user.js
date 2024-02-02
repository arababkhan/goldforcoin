var express = require('express')
var router = express.Router();
var userController = require("./../controller/userController")
const { check } = require('express-validator');
var adminauth = require("./../../../middleware/adminauth");

router.post('/login',[check('user_account').not().isEmpty()],userController.login)
router.post('/setadmin', [check('user_account').not().isEmpty()], [adminauth], userController.update)

module.exports = router