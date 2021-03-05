let mongoose = require('mongoose');
let uniqueValidator = require('mongoose-unique-validator');
let passportLocalMongoose = require('passport-local-mongoose');



let userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: {type: String, unique: true, required: true}
})

userSchema.plugin(uniqueValidator)
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema)
