'use strict';

const { PG_HOST, PG_USERNAME, PG_DATABASE, PG_PASSWORD, PG_PORT } = require('../config');

const DATABASE = {
	client: 'pg',
	connection: {
		host: PG_HOST,
		database: PG_DATABASE,
		port: PG_PORT,
		user: PG_USERNAME,
		password: PG_PASSWORD
	},
	pool: { min: 0, max: 3 },		// Fix issue w/ ElephantSQL
	debug: false					// set to true for Outputs knex debugging information
}

const knex = require("knex")(DATABASE);

module.exports = knex;
