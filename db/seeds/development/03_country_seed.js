exports.seed = function (knex, Promise) {
	return knex('country').del() // Deletes ALL existing entries
};