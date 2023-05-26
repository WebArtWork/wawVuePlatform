const mongoose = require('mongoose');
const Schema = mongoose.Schema({
	title: String,
	formId: String,
	active: Boolean,
	components: [{
		name: String,
		key: String,
		root: Boolean,
		fields: [{
			name: String,
			value: String
		}],
		components: [{}]
	}]
});

Schema.methods.create = function(obj, user, sd) {
	this.title = obj.title;
	this.active = !!obj.active;
	this.formId = obj.formId;
	this.components = obj.components;
}

module.exports = mongoose.model('Form', Schema);
