var order = require('../model/orderModel')
var Counter = require('../model/counterModel')
const { validationResult } = require('express-validator');
const {Web3} = require('web3')
const dotenv = require('dotenv');
dotenv.config()

async function getNextSequenceValue(sequenceName) {
    const counterUpdate = await Counter.findOneAndUpdate(
      { _id: sequenceName },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    return counterUpdate.seq;
}
/**************************************************************
*  This is the function which used to add order.
**************************************************************/
exports.addOrder = async function(req,res) {
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
        const w_paidAmount = await getDepositDetail(req.body.order.chain, req.body.order.transaction)
        let w_orderTemp = req.body.order;
        if(w_paidAmount > -1) {
            w_orderTemp = {...w_orderTemp, paid: w_paidAmount}
        }

        const nextOrderId = await getNextSequenceValue('orderId');
        const newOrder = new order({ ...w_orderTemp, orderId: nextOrderId });
        await newOrder.save();

        res.json({
            status: true,
            message: 'added order successfully'
        })        
    } catch (error) {
        res.json({
            status: false,
            message: 'add failed',
            error: error
        })
    }
}

exports.updateOrder = async function(req,res) {
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
        await order.findOneAndUpdate({orderId: req.body.orderId}, {$set: req.body.data}, {new: true})
        res.json({
            status: true,
            message: 'updated successfully',
        })
    } catch (error) {
        res.json({
            status: false,
            message: 'update failed',
            error: error
        })
    }
}

exports.getOrders = async function(req, res) {
    try {
        let w_orders = await order.find({status: {$ne: 'delivered'}})
        res.json({
            status: true,
            orders: w_orders
        })
    } catch(error) {
        res.json({
            status: false,
            message: "getting data failed",
            error: error
        })
    }
}

exports.getMyOrders = async function(req, res) {
    try {
        let w_orders = await order.find({status: {$ne: 'delivered'}, user: req.decoded.account.toLowerCase()})
        console.log(req.decoded.account.toLowerCase())
        console.log(w_orders)
        res.json({
            status: true,
            orders: w_orders
        })
    } catch(error) {
        console.log(error)
        res.json({
            status: false,
            message: "getting data failed",
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

async function getDepositDetail(chain, txHash) {
    try {
        let w_chain_rpc = ''
        if(chain == 1) {
            w_chain_rpc = process.env.eth_mainnet
        } else if(chain == 5) {
            w_chain_rpc = process.env.eth_testnet
        } else if(chain == 56) {
            w_chain_rpc = process.env.bsc_mainnet
        } else if(chain == 97) {
            w_chain_rpc = process.env.bsc_testnet
        }
        const web3 = new Web3(w_chain_rpc);

        // Fetch the transaction receipt to get logs
        const receipt = await web3.eth.getTransactionReceipt(txHash);
        const depositEventAbi = [
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "currency",
                "type": "string"
            }
        ];

        for (let log of receipt.logs) {
            try {
                const decoded = web3.eth.abi.decodeLog(depositEventAbi, log.data, log.topics.slice(1));
                if (decoded) {
                    let w_bigIntValue = BigInt(decoded.amount)
                    let w_decimal = 18;
                    if (chain == 1)
                        w_decimal = 6;
                    let w_paidAmount = coins(w_bigIntValue.toString(), w_decimal)
                    return w_paidAmount;
                    // console.log(`Deposit Details: Sender: ${log.topics[1]}, Recipient (Contract Address): ${receipt.to}, Amount: ${decoded.amount}, Currency (isUSDT): ${decoded.currency}`);
                }
            } catch (error) {

            }
        }
        return -1;
    } catch (error) {
        console.error("Error fetching transaction receipt:", error);
        return -1;
    }
}

function coins(unitsValue, decimals) {
    const regex = new RegExp(`^\\d+${0 > 0 ? `(\\.\\d{1,${0}})?` : ''}$`);
    let w_valid = regex.test(unitsValue);
    if (!w_valid) throw new Error('Invalid amount');
    if (decimals === 0) return unitsValue;
    const s = unitsValue.padStart(1 + decimals, '0');
    return `${s.slice(0, -decimals)}.${s.slice(-decimals)}`;
  }