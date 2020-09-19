'use strict';

const userIntFields = [
	'selected_vehicle_id'
];

const vehicleIntFields = [
	'vehicle_year',
	'type_id',
	'make_id',
	'sub_model_id',
	'transmission_id',
	'drive_type_id',
	'body_type_id',
	'bed_type_id',
	'oil_change_frequency',
	'default_energy_type_id',
	'default_fuel_grade_id',
];

const fuelPurchaseIntFields = [
	'vehicle_id',
	'fuel_type_id',
	'odometer',
	'amount',
	'price',
	'drive_type_id',
	'body_type_id',
	'bed_type_id',
	'oil_change_frequency',
	'default_energy_type_id',
	'default_fuel_grade_id',
];

module.exports = {
	userIntFields,
	vehicleIntFields,
	fuelPurchaseIntFields
};