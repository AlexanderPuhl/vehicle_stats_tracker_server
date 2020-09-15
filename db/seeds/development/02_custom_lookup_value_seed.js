exports.seed = function (knex) {
	// Deletes ALL existing entries
	return knex('custom_lookup_value').del()
		.then(function () {
			// Inserts seed entries
			return knex('custom_lookup_value').insert([
				{
					custom_lookup_id: "select custom_lookup_id from custom_lookup where custom_lookup_descr = 'distance_unit'",
					custom_lookup_value_code: 'KM',
					custom_lookup_value_descr: 'Kilometers'
				},
				{
					custom_lookup_id: "select custom_lookup_id from custom_lookup where custom_lookup_descr = 'distance_unit'",
					custom_lookup_value_code: 'MI',
					custom_lookup_value_descr: 'Miles'
				}
			]);
		});
};
