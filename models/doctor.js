var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var doctorSchema = new Schema({
name: {type: String, required: [true, 'the name is required']},
image: {type: String, required:false},
user: {type: Schema.Types.ObjectId, ref: 'user', required: true},
hospital: {type: Schema.Types.ObjectId, ref: 'hospital', required: [true, 'The hospital is required']}
},{collection: 'doctors'});



module.exports = mongoose.model('doctor', doctorSchema);