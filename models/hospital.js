var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var hospitalSchema = new Schema({
    name: {type: String, required:[true, 'the name is requerid']},
    image: {type: String, required:false},
    user: {type: Schema.Types.ObjectId, ref: 'user', required: true}
}, {collection: 'hospitals'});


module.exports = mongoose.model('hospital', hospitalSchema);
