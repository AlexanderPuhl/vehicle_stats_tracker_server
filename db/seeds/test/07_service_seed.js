exports.seed = function (knex, Promise) {
	return knex('service').del() // Deletes ALL existing entries
};