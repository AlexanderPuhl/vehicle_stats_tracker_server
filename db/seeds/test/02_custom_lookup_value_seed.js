exports.seed = function (knex, Promise) {
	return knex('custom_lookup_value').del() // Deletes ALL existing entries
};