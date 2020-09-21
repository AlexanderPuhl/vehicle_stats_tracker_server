exports.up = function (knex) {
	return knex.schema.createTable('vehicle', table => {
		table.increments('vehicle_id').unique.notNullable
		table.integer('user_id').notNullable
		table.string('vehicle_name', 35).notNullable
		table.integer('vehicle_year')
		table.integer('type_id')
		table.integer('make_id')
		table.integer('model_id')
		table.integer('sub_model_id')
		table.integer('transmission_id')
		table.integer('drive_type_id')
		table.integer('body_type_id')
		table.integer('bed_type_id')
		table.string('vin', 20)
		table.string('license_plate', 20)
		table.string('insurance_number', 50)
		table.integer('oil_change_frequency')
		table.integer('default_energy_type_id')
		table.integer('default_fuel_grade_id')
		table.string('note', 255)
		table.dateTime('created_on').defaultTo(knex.fn.now())
		table.dateTime('modified_on').defaultTo(knex.fn.now())
		table.foreign('user_id').references('user.user_id').onDelete('CASCADE')
	});
};

exports.down = function (knex) {
	return knex.schema.dropTable('vehicle');
};
