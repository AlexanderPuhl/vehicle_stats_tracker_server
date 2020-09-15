exports.up = function (knex) {
	return knex.schema.createTable('user', table => {
		table.increments('user_id').unique.notNullable
		table.string('username', 35).notNullable
		table.string('password', 255).notNullable
		table.string('email', 70).unique.notNullable
		table.string('name', 70).notNullable
		table.integer('selected_vehicle_id').defaultTo(0)
		table.boolean('onboarding').defaultTo(true)
		table.dateTime('created_on').defaultTo(knex.fn.now())
		table.dateTime('last_login').defaultTo(knex.fn.now())
		table.dateTime('modified_on').defaultTo(knex.fn.now())
		table.string('reset_token', 255)
		table.integer('reset_token_expiration')
	});
};

exports.down = function (knex) {
	return knex.schema.dropTable('user');
};
