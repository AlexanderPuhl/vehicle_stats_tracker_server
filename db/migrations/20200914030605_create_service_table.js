exports.up = function (knex) {
  return knex.schema.createTable('service', (table) => {
    table.increments('service_id').unique().notNullable();
    table.integer('user_id').notNullable();
    table.integer('vehicle_id').notNullable();
    table.decimal('odometer', 8, 2).notNullable();
    table.specificType('service_type_ids', 'int[]').notNullable();
    table.decimal('price', 8, 2).notNullable();
    table.string('payment_type', 35);
    table.string('service_center', 35);
    table.string('service_street', 35);
    table.string('service_city', 35);
    table.string('service_state', 35);
    table.integer('service_country_id');
    table.string('service_zip', 15);
    table.string('note', 255);
    table.dateTime('date_of_service').defaultTo(knex.fn.now());
    table.dateTime('created_on').defaultTo(knex.fn.now());
    table.dateTime('modified_on').defaultTo(knex.fn.now());
    table.foreign('vehicle_id').references('vehicle.vehicle_id').onDelete('CASCADE');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('service');
};
