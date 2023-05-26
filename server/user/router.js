const User = require('./schema');
module.exports = async waw => {
	waw.file('user', {
		rename: req => req.user._id+'.jpg',
		ensure: waw.ensure,
		process: async (req, res) => {
			const user = await User.findOne({
				_id: req.user._id
			});

			user.thumb = req.files[0].url;

			await user.save();

			res.json(user.thumb);
		}
	});

	const select = () => '-password -resetPin';

	waw.crud('user', {
		get: {
			ensure: waw.next,
			query: () => {
				return {};
			},
			select
		},
		fetch: [{
			ensure: waw.next,
			query: req => {
				return {
					_id: req.body._id
				}
			},
			select
		},{
			name: 'me',
			query: req => {
				return {
					_id: req.user._id
				}
			},
			select
		}],
		update: [{
			query: req => {
				return {
					_id: req.user._id
				}
			},
			select
		}, {
			name: 'admin',
			ensure: waw.role('admin'),
			query: req => {
				return {
					_id: req.body._id
				}
			},
			select
		}],
		delete: {
			name: 'admin',
			ensure: waw.role('admin'),
			query: req => {
				return {
					_id: req.body._id
				}
			},
			select
		}
	});
};
