exports.seed = function (knex) {
	// Deletes ALL existing entries
	return knex('fuel_purchase').del()
		// Inserts seed entries
		.then(() => {
			return knex('fuel_purchase').insert({
				user_id: 1,
				vehicle_id: 1,
				fuel_type_id: 1,
				fuel_grade: '87',
				odometer: 500,
				amount: 20,
				price: 2,
				fuel_brand: 'Best Brand',
				fuel_station: 'Smiths',
				partial_tank: false,
				missed_prev_fill_up: false,
				note: 'TEST NOTE',
				date_of_fill_up: '2020-09-01 05:22:46.778843'
			});
		}).then(() => {
			return knex('fuel_purchase').insert({
				user_id: 1,
				vehicle_id: 1,
				fuel_type_id: 1,
				fuel_grade: '87',
				odometer: 1000,
				amount: 21,
				price: 3,
				fuel_brand: 'Best Brand',
				fuel_station: 'Smiths',
				partial_tank: false,
				missed_prev_fill_up: false,
				note: 'TEST NOTE',
				date_of_fill_up: '2020-09-14 05:22:46.778843'
			});
		}).then(() => {
			return knex('fuel_purchase').insert({
				user_id: 1,
				vehicle_id: 2,
				fuel_type_id: 2,
				fuel_grade: '85',
				odometer: 400,
				amount: 14,
				price: 2,
				fuel_brand: 'Best Brand',
				fuel_station: 'Smiths',
				partial_tank: false,
				missed_prev_fill_up: false,
				note: 'TEST NOTE',
				date_of_fill_up: '2020-09-05 05:22:46.778843'
			});
		}).then(() => {
			return knex('fuel_purchase').insert({
				user_id: 1,
				vehicle_id: 2,
				fuel_type_id: 2,
				fuel_grade: '85',
				odometer: 800,
				amount: 14,
				price: 2,
				fuel_brand: 'Best Brand',
				fuel_station: 'Smiths',
				partial_tank: false,
				missed_prev_fill_up: false,
				note: 'TEST NOTE',
				date_of_fill_up: '2020-09-15 05:22:46.778843'
			});
		});
};
