exports.seed = function (knex, Promise) {
  return knex('trip').del();
};
