exports.up = function (knex) {
  return knex.schema.createTable('custom_lookup_value', (table) => {
    table.increments('custom_lookup_value_id').unique().notNullable();
    table.integer('custom_lookup_id').notNullable();
    table.string('custom_lookup_value_code', 35).notNullable();
    table.string('custom_lookup_value_descr', 35).notNullable();
    table.dateTime('created_on').defaultTo(knex.fn.now());
    table.dateTime('modified_on').defaultTo(knex.fn.now());
    table.foreign('custom_lookup_id').references('custom_lookup.custom_lookup_id');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('custom_lookup_value');
};
