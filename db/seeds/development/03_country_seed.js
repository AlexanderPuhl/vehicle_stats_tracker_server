exports.seed = function (knex) {
  return knex('country').del();
};
