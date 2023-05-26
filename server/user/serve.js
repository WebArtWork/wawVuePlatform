const fs = require('fs');

const path = require('path');

const template = path.join(process.cwd(), 'template');

const client = path.join(process.cwd(), 'client', 'dist', 'app');

module.exports = function(waw) {
	const seo = {
		image: 'https://webart.work/template/img/spider.svg',
		description: waw.config.description,
		keywords: waw.config.keywords,
		title: waw.config.name
	};

	waw.serve(client);

	if (fs.existsSync(client)) {
		waw.url(
			path.join(client, 'index.html'),
			[
				'/admin/users',
				'/profile',
				'/auth'
			]
		);
	} else {
		console.log("You don't have client build, careful with committing without that");
	}

	waw.serve(template, {
		prefix: '/template'
	});

	waw.build(template, 'index');

	waw.url(
		path.join(template, 'dist', 'index.html'),
		'/',
		seo
	);
};
