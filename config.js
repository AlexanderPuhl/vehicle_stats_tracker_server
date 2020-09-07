'use strict';

require('dotenv').config();

module.exports = {
	NODE_ENV: process.env.NODE_ENV || 'test',
	SERVER_PORT: process.env.SERVER_PORT || 8080,
	CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
	JWT_SECRET: process.env.JWT_SECRET,
	JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1d',
	PG_HOST: process.env.PG_HOST || 'localhost',
	PG_USERNAME: process.env.PG_USERNAME || 'apuhl',
	PG_DATABASE: process.env.PG_DATABASE || 'vehicle_tracker',
	PG_TEST_DATABASE: process.env.PG_TEST_DATABASE || 'vehicle_tracker_test',
	PG_PASSWORD: process.env.PG_PASSWORD,
	PG_PORT: process.env.PG_PORT || 5432
};
