exports.seed = function (knex) {
	// Deletes ALL existing entries
	return knex('fuel_purchase').del()
		// Inserts seed entries
		.then(() => {
			return knex('fuel_purchase').insert({
				user_id: 1,
				vehicle_id: 1,
				fuel_type_id: 1,
				odometer: 500,
				amount: 20,
				price: 2,
				fuel_brand: 'Shell',
				fuel_station: 'V-Power',
				partial_tank: false,
				missed_prev_fill_up: false,
			});
		}).then(() => {
			return knex('fuel_purchase').insert({
				user_id: 1,
				vehicle_id: 1,
				fuel_type_id: 1,
				odometer: 1000,
				amount: 21,
				price: 3,
				fuel_brand: 'Shell',
				fuel_station: 'V-Power',
				partial_tank: false,
				missed_prev_fill_up: false,
			});
		}).then(() => {
			return knex('fuel_purchase').insert({
				user_id: 1,
				vehicle_id: 2,
				fuel_type_id: 2,
				odometer: 400,
				amount: 14,
				price: 2,
				fuel_brand: 'Shell',
				fuel_station: 'V-Power',
				partial_tank: false,
				missed_prev_fill_up: false,
			});
		}).then(() => {
			return knex('fuel_purchase').insert({
				user_id: 1,
				vehicle_id: 2,
				fuel_type_id: 2,
				odometer: 800,
				amount: 14,
				price: 2,
				fuel_brand: 'Shell',
				fuel_station: 'V-Power',
				partial_tank: false,
				missed_prev_fill_up: false,
			});
		});
};
