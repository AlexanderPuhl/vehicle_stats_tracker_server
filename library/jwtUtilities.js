'use strict';

const jwt = require('jsonwebtoken');

const { JWT_SECRET, JWT_EXPIRATION } = require('../config');

exports.createAuthToken = (user) => {
	const payload = {
		user_id: user.user_id,
		username: user.username,
		email: user.email,
		name: user.name,
		selected_vehicle_id: user.selected_vehicle_id,
		onboarding: user.onboarding,
		reset_token: user.reset_token,
		reset_token_expiration: user.reset_token_expiration,
		iat: Date.now()
	};
	return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION, algorithm: 'HS256' });
}