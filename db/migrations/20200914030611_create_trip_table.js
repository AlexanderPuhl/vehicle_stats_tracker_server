exports.up = function (knex) {
  return knex.schema.createTable('trip', (table) => {
    table.increments('trip_id').unique().notNullable();
    table.integer('user_id').notNullable();
    table.integer('vehicle_id').notNullable();
    table.decimal('odometer', 8, 2).notNullable();
    table.decimal('price', 8, 2).notNullable();
    table.string('payment_type', 35);
    table.string('note', 255);
    table.dateTime('date_of_trip').defaultTo(knex.fn.now());
    table.dateTime('created_on').defaultTo(knex.fn.now());
    table.dateTime('modified_on').defaultTo(knex.fn.now());
    table.foreign('vehicle_id').references('vehicle.vehicle_id').onDelete('CASCADE');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('trip');
};
