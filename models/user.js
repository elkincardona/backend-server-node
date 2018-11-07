var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

mongoose.set('useCreateIndex', true);

var Schema = mongoose.Schema;


var validRoles = {
    values: ['admin_role','user_role'],
    message: '{VALUE} it\'s not a valid role'
};


var userSchema = new Schema({
    name: { type: String,  required: [true, 'The name is requerid']},
    email: { type: String, required: [true, 'The email is requerid'], unique: true},
    password: { type: String, required: [true, 'The password is requerid']},
    image: { type: String, required: false},
    role: { type: String, required: true, default: 'user_role', enum: validRoles},
    google: { type: Boolean, default: false}
});

// plugin for better unique validation
userSchema.plugin(uniqueValidator, {message: 'will be unique'});

module.exports = mongoose.model('user', userSchema);
// module.exports = mongoose.model('user', userSchema, 'users'); // ***** this code go directly for the real collection  name