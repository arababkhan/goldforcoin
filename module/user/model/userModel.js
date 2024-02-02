var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

// Setup schema
var userSchema = mongoose.Schema({
    account: {
        type: String,
        unique: [ true , 'account already exists. Please try a different account']
    },
    role: {
        type: Boolean
    },
    create_date: {
        type: Date,
        default: Date.now
    }
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('users', userSchema, 'users');