exports.seed = function (knex, Promise) {
	return knex('trip').del() // Deletes ALL existing entries
};