var mongoose = require('mongoose');

// Setup schema
var weightSchema = mongoose.Schema({
    weight: {
        type: Number
    }
});

module.exports = mongoose.model('weight', weightSchema, 'weight');