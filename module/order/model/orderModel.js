var mongoose = require('mongoose');

// Setup schema
var productSchema = mongoose.Schema({
    weight: {
        type: Number
    },
    price: {
        type: Number
    },
    quantity: {
        type: Number
    },
    cost: {
        type: Number
    }
});

var orderSchema = mongoose.Schema({
    orderId: {
        type: Number
    },
    user: {
        type: String
    },
    email: {
        type: String
    },
    full_name: {
        type: String
    },
    country: {
        type: String
    },
    address: {
        type: String
    },
    city: {
        type: String
    },
    code: {
        type: String
    },
    prod_kind: {
        type: String
    },
    chain: {
        type: Number
    },
    coin: {
        type: String
    },
    shipfee: {
        type: Number
    },
    cost: {
        type: Number
    },
    paid: {
        type: Number,
        default: 0
    },
    transaction: {
        type: String
    },
    status: {
        type: String
    },
    tracking_number: {
        type: String,
        default: ''
    },
    created: {
        type: Date,
        default: Date.now
    },
    products: [productSchema]
});

module.exports = mongoose.model('order', orderSchema, 'order');