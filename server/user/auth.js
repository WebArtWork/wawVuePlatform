const User = require(__dirname + '/schema.js');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const nJwt = require('njwt');
const fs = require('fs');
module.exports = async function (waw) {
	if (!waw.config.signingKey) {
		waw.config.signingKey = uuidv4();
		let serverJson = waw.readJson(process.cwd() + '/server.json');
		serverJson.signingKey = waw.config.signingKey;
		waw.writeJson(process.cwd() + '/server.json', serverJson);
	}
	// initialize
	if (waw.config.mail) {
		const nodemailer = require("nodemailer");
		let transporter = nodemailer.createTransport({
			host: waw.config.mail.host,
			port: waw.config.mail.port,
			secure: waw.config.mail.secure,
			auth: waw.config.mail.auth
		});
		waw.send = (opts, cb = resp => { }) => {
			transporter.sendMail({
				from: waw.config.mail.from,
				subject: opts.subject || waw.config.mail.subject,
				to: opts.to,
				text: opts.text,
				html: opts.html
			}, cb);
		}
	} else {
		waw.send = () => { }
	}
	if (mongoose.connection.readyState == 0) {
		mongoose.connect(waw.mongoUrl, {
			useUnifiedTopology: true,
			useNewUrlParser: true
		});
		mongoose.Promise = global.Promise;
	}
	/*
	*	Serve Client
	*/
	waw.serve(process.cwd() + '/client/dist/app');
	const client = process.cwd() + '/client/dist/app/index.html';
	if (fs.existsSync(client)) {
		waw.url(client, '/admin/users /profile /auth');
	} else {
		console.log("You don't have client build, careful with committing without that");
	}
	/*
	*	Serve Template
	*/
	waw.serve(process.cwd() + '/template', {
		prefix: '/template'
	});
	waw.build(process.cwd() + '/template', 'index');
	waw.url(process.cwd() + '/template/dist/index.html', '/', {
		title: waw.config.name,
		description: waw.config.description,
		keywords: waw.config.keywords,
		image: 'https://webart.work/template/img/spider.svg'
	});
	/*
	*	Set is on users from config
	*/
	const set_is = (email, is) => {
		User.findOne({
			email: email
		}, function (err, user) {
			if (!user) return;
			if (!user.is) user.is = {};
			user.is[is] = true;
			user.markModified('is');
			user.save((err) => {
				if (err) console.log(err);
			});
		});
	}
	if (waw.config.user && waw.config.user.is) {
		for (let is in waw.config.user.is) {
			let emails = waw.config.user.is[is].split(' ');
			for (var i = 0; i < emails.length; i++) {
				set_is(emails[i], is);
			}
		}
	}
	/*
	*	Initialize User and Mongoose
	*/
	const router = waw.router('/api/user');
	router.post("/status", function (req, res) {
		User.findOne({
			$or: [{
				reg_email: req.body.email.toLowerCase()
			}, {
				email: req.body.email.toLowerCase()
			}]
		}, function (err, user) {
			var json = {};
			json.email = !!user;
			if (user && req.body.password) {
				json.pass = user.validPassword(req.body.password);
			}
			res.json(json);
		});
	});
	const new_pin = (user, cb) => {
		user.resetPin = Math.floor(Math.random() * (999999 - 100000)) + 100000;
		console.log(user.resetPin);
		user.markModified('data');
		user.save(function (err) {
			if (err) throw err;
			waw.send({
				to: user.email,
				subject: 'Code: ' + user.resetPin,
				html: 'Code: ' + user.resetPin
			}, cb);
		});
	}
	router.post("/request", function (req, res) {
		User.findOne({
			email: req.body.email.toLowerCase()
		}, function (err, user) {
			new_pin(user, ()=>{
				res.json(true);
			});
		});
	});
	router.post("/change", function (req, res) {
		User.findOne({
			email: req.body.email.toLowerCase()
		}, function (err, user) {
			if (user.resetPin == req.body.pin) {
				user.password = user.generateHash(req.body.password);
				delete user.resetPin;
				user.save(function (err) {
					if (err) throw err;
					res.json(true);
				});
			} else {
				new_pin(user, () => {
					res.json(false);
				});
			}
		});
	});
	router.post("/changePassword", waw.ensure, async (req, res) => {
		const user = await User.findOne({ _id: req.user._id });
		if (user.validPassword(req.body.oldPass)) {
			user.password = user.generateHash(req.body.newPass);
			user.save(function () {
				res.json(true);
			});
		} else res.json(false);
	});
	waw.use((req, res, next) => {
		if (req.headers.token) {
			nJwt.verify(req.headers.token, waw.config.signingKey, (err, verifiedJwt) => {
				if (err) {
					res.set('remove', 'token');
					res.set('Access-Control-Expose-Headers', 'field')
					next();
				} else {
					req.user = verifiedJwt.body;
					next();
				}
			});
		} else next();
	});
	router.post('/login', (req, res) => {
		User.findOne({
			email: req.body.email.toLowerCase(),
			blocked: {
				$ne: true
			}
		}, function (err, user) {
			if (err || !user || !user.validPassword(req.body.password)) {
				return res.json(false);
			}
			user = JSON.parse(JSON.stringify(user));
			delete user.password;
			delete user.resetPin;
			user.token = nJwt.create(user, waw.config.signingKey);
			user.token.setExpiration(new Date().getTime() + (48 * 60 * 60 * 1000));
			user.token = user.token.compact();
			res.json(user);
		});
	});
	router.post('/sign', (req, res) => {
		User.findOne({
			email: req.body.email.toLowerCase(),
			blocked: {
				$ne: true
			}
		}, function (err, user) {
			if (err || user) {
				return res.json(false);
			}
			user = new User();
			user.is = {
				admin: false
			};
			user.email = req.body.email.toLowerCase();
			user.reg_email = req.body.email.toLowerCase();
			user.password = user.generateHash(req.body.password);
			user.data = {};
			user.save(function (err) {
				if (err) throw err;
				user = JSON.parse(JSON.stringify(user));
				delete user.password;
				delete user.resetPin;
				user.token = nJwt.create(user, waw.config.signingKey);
				user.token.setExpiration(new Date().getTime() + (48 * 60 * 60 * 1000));
				user.token = user.token.compact();
				res.json(user);
			});
		});
	});
	// End of Crud
};
