var mongoose = require('mongoose');

// Setup schema
var priceSchema = mongoose.Schema({
    pricePerGram: {
        type: Number,
        default: 0
    },
    costShip: {
        type: Number,
        default: 0
    },
    costStorage: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('price', priceSchema, 'price');