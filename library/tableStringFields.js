'use strict';

const userStringFields = [
	'username',
	'password',
	'email',
	'name'
];

const vehicleStringFields = [
	'vehicle_name',
	'vin',
	'license_plate',
	'insurance_number',
	'notes'
];

const fuelPurchaseStringFields = [
	'fuel_grade',
	'fuel_brand',
	'fuel_station',
	'note'
];

module.exports = {
	userStringFields,
	vehicleStringFields,
	fuelPurchaseStringFields
};