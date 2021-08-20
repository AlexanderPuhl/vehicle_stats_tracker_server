exports.up = function (knex) {
  return knex.schema.createTable('custom_lookup', (table) => {
    table.increments('custom_lookup_id').unique().notNullable();
    table.string('custom_lookup_code', 35).notNullable();
    table.string('custom_lookup_descr', 35).notNullable();
    table.dateTime('created_on').defaultTo(knex.fn.now());
    table.dateTime('modified_on').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('custom_lookup');
};
