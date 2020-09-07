'use strict';

const { Strategy: LocalStrategy } = require('passport-local');
const bcrypt = require('bcryptjs');
const knex = require('../db/knexConfig.js');

const customFields = {
	username: '',
	password: ''
};

const verifyCallback = (username, password, done) => {
	let user;

	knex('user')
		.where({ username: username })
		.first()
		.then(results => {
			user = results;
			if (!user) {
				return Promise.reject({
					reason: 'LoginError',
					message: 'Incorrect username',
					location: 'username'
				});
			}
			return bcrypt.compare(password, user.password);
		})
		.then(isValid => {
			if (!isValid) {
				return Promise.reject({
					reason: 'LoginError',
					message: 'Incorrect password',
					location: 'password'
				});
			}
			let tempUser = {
				user_id: user.user_id,
				username: user.username,
				email: user.email
			};
			return done(null, tempUser);
		})
		.catch(err => {
			if (err.reason === 'LoginError') {
				return done(null, false);
			}
			return done(err);
		});
}

const localStrategy = new LocalStrategy((customFields), verifyCallback)

module.exports = localStrategy;
