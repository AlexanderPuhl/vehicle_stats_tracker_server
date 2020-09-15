exports.seed = function (knex) {
	// Deletes ALL existing entries
	return knex('vehicle').del()
		// Inserts seed entries
		.then((userId) => {
			return knex('vehicle').insert({
				user_id: 1,
				name: 'Jeep',
				vehicle_year: 2020,
				oil_change_frequency: 5000
			});
		}).then((userId) => {
			return knex('vehicle').insert({
				user_id: 1,
				name: 'Kia',
				vehicle_year: 2016,
				oil_change_frequency: 3000
			});
		});
};
