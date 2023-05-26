module.exports = async function(waw) {
	waw.crud('form', {
		get: {
			ensure: waw.next,
			query: req => {
				return {}
			}
		},
		fetch: {
			ensure: waw.next,
			query: req => {
				return {
					_id: req.body._id
				}
			}
		},
		update: {
			ensure: waw.next,
			query: req => {
				return {
					_id: req.body._id
				}
			}
		},
		delete: {
			ensure: waw.next,
			query: req => {
				return {
					_id: req.body._id
				}
			}
		}
	});
};
