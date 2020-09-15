exports.up = function (knex) {
	return knex.schema.createTable('fuel_purchase', table => {
		table.increments('fuel_purchase_id').unique.notNullable
		table.integer('user_id').notNullable
		table.integer('vehicle_id').notNullable
		table.integer('fuel_type_id').notNullable
		table.string('fuel_grade', 25)
		table.decimal('odometer', 8, 2)
		table.decimal('amount', 8, 2)
		table.decimal('price', 8, 2)
		table.string('fuel_brand', 50)
		table.string('fuel_station', 50)
		table.boolean('partial_tank')
		table.boolean('missed_prev_fill_up')
		table.string('note', 255)
		table.dateTime('date_of_fill_up').defaultTo(knex.fn.now())
		table.dateTime('created_on').defaultTo(knex.fn.now())
		table.dateTime('modified_on').defaultTo(knex.fn.now())
		table.foreign('vehicle_id').references('vehicle.vehicle_id').onDelete('CASCADE')
	});
};

exports.down = function (knex) {
	return knex.schema.dropTable('fuel_purchase');
};
