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
        const w_paidAmount = await getDepositDetail(req.body.order.chain, req.body.order.coin, req.body.order.transaction)
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

async function getDepositDetail(chain, coin, txHash) {
    try {
        let w_chain_rpc = ''
        let w_contract = ''
        let w_decimals = 1;

        const Contract_ABI = [
            {
              "constant": false,
              "inputs": [
                {
                  "name": "_to",
                  "type": "address"
                },
                {
                  "name": "_value",
                  "type": "uint256"
                }
              ],
              "name": "transfer",
              "outputs": [
                {
                  "name": "",
                  "type": "bool"
                }
              ],
              "type": "function"
            }
        ];

        if(chain == 1) {
            w_chain_rpc = process.env.eth_mainnet
            w_decimals = 6;
            if(coin == 'usdt') {
                w_contract = '0xdac17f958d2ee523a2206206994597c13d831ec7';
            } else if(coin == 'usdc') {
                w_contract = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
            }
        } else if(chain == 5) {
            w_decimals = 6;
            w_chain_rpc = process.env.eth_testnet
            if(coin == 'usdt') {
                w_contract = '0x94829DD28aE65bF4Ff6Ce3A687B1053eC7229272';
            } else if(coin == 'usdc') {
                w_contract = '0x07865c6e87b9f70255377e024ace6630c1eaa37f';
            }
        } else if(chain == 56) {
            w_decimals = 18;
            w_chain_rpc = process.env.bsc_mainnet
            if(coin == 'usdt') {
                w_contract = '0x55d398326f99059fF775485246999027B3197955';
            } else if(coin == 'usdc') {
                w_contract = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d';
            }
        } else if(chain == 97) {
            w_decimals = 18;
            w_chain_rpc = process.env.bsc_testnet
            if(coin == 'usdt') {
                w_contract = '0xCA7ff3eBFceC8869814614351a58bF8f18CE8bc7';
            } else if(coin == 'usdc') {
                w_contract = '0x64544969ed7ebf5f083679233325356ebe738930';
            }
        }
        const web3 = new Web3(w_chain_rpc);
        // Fetch the transaction receipt to get logs
        const tx = await web3.eth.getTransaction(txHash);
        if (!tx) {
            console.log('Transaction not found');
            return -1;
        }
        if (tx.to && tx.to.toLowerCase() === w_contract.toLowerCase()) {
            const contract = new web3.eth.Contract(Contract_ABI, w_contract);
            const inputData = tx.input;
            
            const methodSignature = inputData.slice(0,10); // First 4 bytes is the method ID
            const [method] = contract.options.jsonInterface.filter((method) => method.signature === methodSignature);
        
            if (method && method.name === "transfer") {
              const decodedParams = web3.eth.abi.decodeParameters(method.inputs, '0x' + inputData.slice(10));
              if(w_decimals == 6){
                console.log(`USDT Transferred: ${web3.utils.fromWei(decodedParams._value, 'mwei')} to address: ${decodedParams._to}`);
                return web3.utils.fromWei(decodedParams._value, 'mwei')
              } else if(w_decimals == 18) {
                console.log(`USDT Transferred: ${web3.utils.fromWei(decodedParams._value, 'ether')} to address: ${decodedParams._to}`);
                return web3.utils.fromWei(decodedParams._value, 'ether')
              }
            } else {
              console.log('Transaction is not a USDT transfer.');
              return -1;
            }
        } else {
            console.log('Transaction is not related to the USDT contract.');
            return -1;
        }
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