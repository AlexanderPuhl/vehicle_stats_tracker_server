'use strict';

const userRequiredFields = [
	'username',
	'password',
	'email',
	'name'
]

const vehicleRequiredFields = [
	'vehicle_name'
];

const fuelPurchaseRequiredFields = [
	'vehicle_id',
	'fuel_type_id',
	'odometer',
	'amount',
	'price',
	'date_of_fill_up'
];


module.exports = {
	userRequiredFields,
	vehicleRequiredFields,
	fuelPurchaseRequiredFields
};