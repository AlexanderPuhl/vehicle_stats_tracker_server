'use strict';

const userFieldSizes = {
	username: { min: 1, max: 35 },
	password: { min: 8, max: 72 },
	email: { min: 3, max: 70 },
	name: { min: 1, max: 70 }
};

const vehicleFieldSizes = {
	name: { min: 1, max: 35 },
	vin: { min: 1, max: 20 },
	license_plate: { min: 1, max: 20 },
	insurance_number: { min: 1, max: 50 },
	notes: { min: 1, max: 255 }
};

const fuelPurchaseFieldSizes = {
	fuel_grade: { min: 1, max: 25 },
	fuel_brand: { min: 1, max: 50 },
	fuel_station: { min: 1, max: 50 },
	note: { min: 1, max: 255 }
};

module.exports = {
	userFieldSizes,
	vehicleFieldSizes,
	fuelPurchaseFieldSizes
};
