'use strict';

const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { JWT_SECRET } = require('../config');
const pg = require('../db/pg');

const options = {
	secretOrKey: JWT_SECRET,
	jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
	algorithms: ['HS256'],
};

const verifyCallBack = async (payload, done) => {
	const { user_id, username } = payload;

	const { rows } = await pg.query('SELECT * FROM public.user WHERE user_id = $1 AND username = $2', [user_id, username]);
	if (rows.length === 0) {
		return done(null, false, { message: 'Incorrect user' });
	}
	const row = rows[0];
	const user = {
		user_id: row.user_id,
		username: row.username,
		email: row.email,
		name: row.name,
		selected_vehicle_id: row.selected_vehicle_id,
		onboarding: row.onboarding,
		reset_token: row.reset_token,
		reset_token_expiration: row.reset_token_expiration
	};
	return done(null, user);
}

const jwtStrategy = new JwtStrategy(options, verifyCallBack);

module.exports = jwtStrategy;