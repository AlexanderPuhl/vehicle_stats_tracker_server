'use strict';

const userUpdateableFields = [
	'password',
	'email',
	'name',
	'onboarding',
	'selected_vehicle_id'
]

const vehicleUpdateableFields = [
	'name',
	'vehicle_year',
	'type_id',
	'make_id',
	'model_id',
	'sub_model_id',
	'transmission_id',
	'drive_type_id',
	'body_type_id',
	'bed_type_id',
	'vin',
	'license_plate',
	'insurance_number',
	'oil_change_frequency',
	'default_energy_type_id',
	'default_fuel_grade_id',
	'note'
];

const fuelPurchaseUpdateableFields = [
	'vehicle_id',
	'fuel_type_id',
	'fuel_grade',
	'odometer',
	'amount',
	'price',
	'fuel_brand',
	'fuel_station',
	'partial_tank',
	'missed_prev_fill_up',
	'note',
	'date_of_fill_up',
];

module.exports = {
	userUpdateableFields,
	vehicleUpdateableFields,
	fuelPurchaseUpdateableFields
};
