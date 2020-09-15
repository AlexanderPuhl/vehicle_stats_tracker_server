'use strict';

const { Strategy: LocalStrategy } = require('passport-local');
const bcrypt = require('bcryptjs');
const pg = require('../db/pg');

const customFields = {
	username: '',
	password: ''
};

const verifyCallback = async (username, password, done) => {
	let user;

	const { rows } = await pg.query('SELECT * FROM public.user WHERE username = $1', [username]);
	user = rows[0];
	if (rows.length === 0) {
		return done(null, false, { message: 'Incorrect username' });
	}
	const isValid = await bcrypt.compare(password, user.password);
	if (!isValid) {
		return done(null, false, { message: 'Incorrect password.' });
	}
	let tempUser = {
		user_id: user.user_id,
		username: user.username,
		email: user.email
	};
	return done(null, tempUser);
}

const localStrategy = new LocalStrategy((customFields), verifyCallback)

module.exports = localStrategy;
