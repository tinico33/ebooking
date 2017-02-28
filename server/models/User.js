var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
    email: String,
    password: String,
    token: String,
    firstname: String,
    lastname: String
});

module.exports = mongoose.model('User', UserSchema);