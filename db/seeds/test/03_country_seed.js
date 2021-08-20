exports.seed = function (knex, Promise) {
  return knex('country').del();
};
