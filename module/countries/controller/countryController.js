var country = require('./../model/countryModel')
var jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const dotenv = require('dotenv');
dotenv.config()

/**************************************************************
*  This is the function which used to register new countries.
**************************************************************/
exports.register = async function(req,res) {
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
        await country.deleteMany({});
        let w_docs = await country.insertMany(req.body.countries);
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

/*********************************************************
*  This is the function which used to get all countries
**********************************************************/
exports.getCountries = async function(req,res) {
    try {
        let w_doc_ship = await country.find({isStorage: false}, 'country');
        let w_doc_storage = await country.find({isStorage: true}, 'country')

        if(this.isEmptyObject(w_doc_ship) && this.isEmptyObject(w_doc_storage)) {
            res.json({
                status: false,
                message: "country doesn't exist",
                err: 'error'
            });
        } else {
            let w_ship_countries = w_doc_ship.map((obj) => {return obj.country})
            let w_storage_countries = w_doc_storage.map((obj) => {return obj.country})
            res.json({
                status: true,
                ship: w_ship_countries,
                storage: w_storage_countries,
                message:"got successfully",
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