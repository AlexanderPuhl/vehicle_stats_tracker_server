exports.up = function (knex) {
  return knex.schema.createTable('country', (table) => {
    table.increments('country_id').unique().notNullable();
    table.specificType('iso', 'CHAR(2)').notNullable();
    table.string('name', 80).notNullable();
    table.string('nicename', 80).notNullable();
    table.specificType('iso3', 'CHAR(3)').notNullable();
    table.specificType('numcode', 'SMALLINT').notNullable();
    table.integer('phonecode').notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('country');
};
