var mongoose = require('mongoose');
var Schema = mongoose.Schema({
	name: String,
	description: String,
	author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	moderators: [{type: mongoose.Schema.Types.ObjectId, sparse: true, ref: 'User'}],
	domain: {type: String, sparse: true, trim: true},
	url: {type: String, sparse: true, trim: true},
	components: [{
		folder: String,
		field: {}
	}],
	sections: [{
		folder: String,
		field: {},
		components: [{
			folder: String,
			field: {}
		}]
	}]
});

Schema.methods.create = function(obj, user, sd) {
	this.author = user._id;
	this.moderators = [user._id];
	this.name = obj.name;
	this.description = obj.description;
}

module.exports = mongoose.model('Cpage', Schema);
