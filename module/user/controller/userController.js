var users = require('./../model/userModel')
var jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const dotenv = require('dotenv');
dotenv.config()

/**************************************************************
*  This is the function which used to create new user and login.
**************************************************************/
exports.login = async function(req,res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors:errors.array()
        });
        return;
    }  
    
    query = {account:req.body.user_account.toLowerCase()};
    await this.getToken(query,req,res);
}

/************************************************************
 * This is the function which used to process getting token
 ***********************************************************/
getToken = async function(query,req,res) {
    try {
        const w_doc = await users.findOne(query);

        if(this.isEmptyObject(w_doc)) {
            
            const myDoc = new users({
                account: query.account,
                role: 0
            })
            let w_doc = await myDoc.save()
            let token = jwt.sign({authenticated: true, account:w_doc.account, role: w_doc.role, _id:w_doc._id},
                process.env.SECRET_KEY,
                { 
                    expiresIn: '24h' // expires in 24 hours
                }
            );
            res.json({
                status: true,
                token: token,
                message:"login successfully",
            }); 
        } else {
            let token = jwt.sign({authenticated: true, account:w_doc.account, role: w_doc.role, _id:w_doc._id},
                process.env.SECRET_KEY,
                { 
                    expiresIn: '24h' // expires in 24 hours
                }
            );
            res.json({
                status: true,
                token:token,
                message:"login successfully",
            });
        }
    } catch (err) {
        console.log(err)
        res.json({
            status: false,
            message: "Request failed",
            errors:err
        });
    }
}

/*********************************************************
*  This is the function which used to update admin user
**********************************************************/
exports.update = async function(req,res) {
    try {
        let query = { account: req.body.user_account.toLowerCase() };
        let update = { $set: { role: 1 } };
        let w_doc = await users.findOneAndUpdate(query, update, { new: true });

        if(this.isEmptyObject(w_doc)) {
            const w_user = new users({
                account: req.body.user_account.toLowerCase(),
                role: 1
            })
            w_doc = w_user.save()
        } 
        query = {account: req.decoded.account.toLowerCase()};
        update = { $set: { role: 0 } };
        w_doc = await users.findOneAndUpdate(query, update, {new: true});
            
        let token = jwt.sign({authenticated: false, account:req.decoded.account, role:0, _id:''},
            process.env.SECRET_KEY,
            { 
                expiresIn: '24h' // expires in 24 hours
            }
        );
        res.json({
            status: true,
            token: token,
            message:"updated successfully",
        });
    } catch(error) {
        console.log(error)
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