exports.seed = function (knex) {
	// Deletes ALL existing entries
	return knex('vehicle').del()
		// Inserts seed entries
		.then((userId) => {
			return knex('vehicle').insert({
				user_id: 1,
				vehicle_name: 'Jeep',
				vehicle_year: 2020,
				type_id: 1,
				make_id: 1,
				model_id: 1,
				sub_model_id: 1,
				transmission_id: 1,
				drive_type_id: 1,
				bed_type_id: 1,
				vin: '5646546465asdfadsf',
				insurance_number: '564654asdfasdf',
				oil_change_frequency: 5000,
				default_energy_type_id: 1,
				default_fuel_grade_id: 1,
				note: 'TEST NOTE'
			});
		}).then((userId) => {
			return knex('vehicle').insert({
				user_id: 1,
				vehicle_name: 'Kia',
				vehicle_year: 2016,
				type_id: 1,
				make_id: 1,
				model_id: 1,
				sub_model_id: 1,
				transmission_id: 1,
				drive_type_id: 1,
				bed_type_id: 1,
				vin: '5646546465asdfadsf',
				insurance_number: '564654asdfasdf',
				oil_change_frequency: 3000,
				default_energy_type_id: 1,
				default_fuel_grade_id: 1,
				note: 'TEST NOTE'
			});
		});
};
