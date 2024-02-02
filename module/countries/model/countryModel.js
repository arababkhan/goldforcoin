var mongoose = require('mongoose');

// Setup schema
var countrySchema = mongoose.Schema({
    country: {
        type: String
    },
    isStorage: {
        type: Boolean
    }
});

module.exports = mongoose.model('country', countrySchema, 'country');