exports.seed = function (knex, Promise) {
  return knex('custom_lookup').del();
};
