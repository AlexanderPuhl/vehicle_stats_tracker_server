const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { JWT_SECRET } = require('../config');
const knex = require('../db/knexConfig.js');

const options = {
	secretOrKey: JWT_SECRET,
	jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
	algorithms: ['HS256'],
};

// const jwtStrategy = new JwtStrategy(options, (payload, done) => done(null, payload.user));

const jwtStrategy = new JwtStrategy(options, function (payload, done) {
	const username = payload.username;
	const user_id = payload.user_id;
	
	knex('user')
		.where({ user_id: user_id, username: username })
		.first()
		.then(results => {
			user = results;
			if (!user) {
				return Promise.reject({
					reason: 'LoginError',
					message: 'Incorrect user',
					location: 'user_id, username'
				});
			}
		})
		.then(() => {
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
});

module.exports = jwtStrategy;
