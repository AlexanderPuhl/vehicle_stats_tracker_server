exports.seed = function (knex, Promise) {
  return knex('service').del();
};
