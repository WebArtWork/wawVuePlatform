var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var schema = mongoose.Schema({
	is: {},
	data: {},
	thumb: {type: String, default: '/assets/default.png'},
	email: {type: String, unique: true, sparse: true, trim: true},
	reg_email: {type: String, unique: true, sparse: true, trim: true},
	password: String,
	name: String,
	resetPin: Number,
	resetCounter: Number,
	resetCreate: Number
}, {
	minimize: false
});
schema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
schema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};
schema.methods.create = function(obj, user, sd) {
	this.thumb = obj.thumb || '/assets/default.png';
	this.reg_email = obj.email;
	this.email = obj.email;
	this.name = obj.name;
	this.data = {};
	this.is = {}
}
module.exports = mongoose.model('User', schema);
