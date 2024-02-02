var price = require('./../model/priceModel')
var weight = require('./../model/weightModel')
const { validationResult } = require('express-validator');
const dotenv = require('dotenv');
dotenv.config()

/**************************************************************
*  This is the function which used to set price of gold, shipping fee, storage fee.
**************************************************************/
exports.setPrice = async function(req,res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors:errors.array()
        });
        return;
    }  
    
    try {
        let w_docs = await price.find()
        if(w_docs.length < 1) {
            const myDoc = new price(req.body.price)
            await myDoc.save()
            res.json({
                status: true,
                message: 'set successfully'
            })
        } else {
            await price.findOneAndUpdate({},{$set: req.body.price}, {new: true})
            res.json({
                status:true,
                message: 'set successfully'
            })
        }
        
    } catch (error) {
        res.json({
            status: false,
            message: 'set failed',
            error: error
        })
    }
}

/*********************************************************
*  This is the function which used to get all price info including price per gram, shipping fee, etc.
**********************************************************/
exports.getPrice = async function(req,res) {
    try {
        let w_doc = await price.findOne()

        if(this.isEmptyObject(w_doc)) {
            res.json({
                status: false,
                message: "Data doesn't exist",
                err: 'error'
            });
        } else {
            res.json({
                status: true,
                data: w_doc,
                message:"",
            });
        }
    } catch(error) {
        res.json({
            status: false,
            message: "error is occured",
            err: error
        });
    }
}

exports.setWeight = async function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors:errors.array()
        });
        return;
    }  
    
    try {
        await weight.deleteMany({});
        let w_docs = await weight.insertMany(req.body.weight);
        res.json({
            status: true,
            message: 'Registered successfully'
        })
    } catch (error) {
        res.json({
            status: false,
            message: 'Register failed',
            error: error
        })
    }
}

exports.getWeight = async function(req, res) {
    try {
        let w_docs = await weight.find()
        let w_temp_arr = w_docs.map((doc) => {return doc.weight + 'g'})
        res.json({
            status: true,
            message: '',
            data: w_temp_arr
        })
    } catch (e) {
        res.json({
            status: false,
            message: 'got failed',
            error: error
        })
    }
}

exports.getWeightObjects = async function(req, res) {
    try {
        let w_docs = await weight.find()
        let w_temp_arr = w_docs.map((doc) => {return {value:doc.weight, label: doc.weight + 'g'}})
        res.json({
            status: true,
            message: '',
            data: w_temp_arr
        })
    } catch (e) {
        res.json({
            status: false,
            message: 'got failed',
            error: error
        })
    }
}
/******************************************************
 *   This is the function check object is empty or not
 *****************************************************/
isEmptyObject = function (obj) {
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return false;
      }
    }
    return true;
}