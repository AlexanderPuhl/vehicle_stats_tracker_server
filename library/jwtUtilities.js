'use strict';

const jwt = require('jsonwebtoken');

const { JWT_SECRET, JWT_EXPIRATION } = require('../config');

exports.createAuthToken = (user) => {
	const payload = {
		user_id: user.user_id,
		username: user.username,
		email: user.email,
		iat: Date.now()
	};
	return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION, algorithm: 'HS256' });
}
