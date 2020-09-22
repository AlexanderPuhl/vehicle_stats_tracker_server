'use strict';

const userTableFields = {
	user_id: {
		required: false,
		updateable: false,
		dataType: 'NUMBER',
		fieldSize: 'null'
	},
	username: {
		required: true,
		updateable: false,
		dataType: 'STRING',
		fieldSize: { MIN: 1, MAX: 35 }
	},
	password: {
		required: true,
		updateable: true,
		dataType: 'STRING',
		fieldSize: { MIN: 8, MAX: 72 }
	},
	email: {
		required: true,
		updateable: true,
		dataType: 'STRING',
		fieldSize: { MIN: 3, MAX: 70 }
	},
	name: {
		required: true,
		updateable: true,
		dataType: 'STRING',
		fieldSize: { MIN: 1, MAX: 70 }
	},
	onboarding: {
		required: false,
		updateable: true,
		dataType: 'BOOLEAN',
		fieldSize: 'null'
	},
	selected_vehicle_id: {
		required: false,
		updateable: true,
		dataType: 'NUMBER',
		fieldSize: 'null'
	},
	last_login: {
		required: false,
		updateable: true,
		dataType: 'DATETIME',
		fieldSize: 'null'
	},
	created_on: {
		required: false,
		updateable: false,
		dataType: 'DATETIME',
		fieldSize: 'null'
	},
	modified_on: {
		required: false,
		updateable: true,
		dataType: 'DATETIME',
		fieldSize: 'null'
	},
	reset_token: {
		required: false,
		updateable: true,
		dataType: 'STRING',
		fieldSize: { MIN: 1, MAX: 255 }
	},
	reset_token_expiration: {
		required: false,
		updateable: true,
		dataType: 'NUMBER',
		fieldSize: 'null'
	}
};

const vehicleTableFields = {
	vehicle_id: {
		required: false,
		updateable: false,
		dataType: 'NUMBER',
		fieldSize: 'null'
	},
	user_id: {
		required: false,
		updateable: false,
		dataType: 'NUMBER',
		fieldSize: 'null'
	},
	vehicle_name: {
		required: true,
		updateable: true,
		dataType: 'STRING',
		fieldSize: { MIN: 1, MAX: 35 }
	},
	vehicle_year: {
		required: false,
		updateable: true,
		dataType: 'NUMBER',
		fieldSize: 'null'
	},
	type_id: {
		required: false,
		updateable: true,
		dataType: 'NUMBER',
		fieldSize: 'null'
	},
	make_id: {
		required: false,
		updateable: true,
		dataType: 'NUMBER',
		fieldSize: 'null'
	},
	model_id: {
		required: false,
		updateable: true,
		dataType: 'NUMBER',
		fieldSize: 'null'
	},
	sub_model_id: {
		required: false,
		updateable: true,
		dataType: 'NUMBER',
		fieldSize: 'null'
	},
	transmission_id: {
		required: false,
		updateable: true,
		dataType: 'NUMBER',
		fieldSize: 'null'
	},
	drive_type_id: {
		required: false,
		updateable: true,
		dataType: 'NUMBER',
		fieldSize: 'null'
	},
	body_type_id: {
		required: false,
		updateable: true,
		dataType: 'NUMBER',
		fieldSize: 'null'
	},
	bed_type_id: {
		required: false,
		updateable: true,
		dataType: 'NUMBER',
		fieldSize: 'null'
	},
	vin: {
		required: false,
		updateable: true,
		dataType: 'STRING',
		fieldSize: { MIN: 1, MAX: 20 }
	},
	license_plate: {
		required: false,
		updateable: true,
		dataType: 'STRING',
		fieldSize: { MIN: 1, MAX: 20 }
	},
	insurance_number: {
		required: false,
		updateable: true,
		dataType: 'STRING',
		fieldSize: { MIN: 1, MAX: 50 }
	},
	oil_change_frequency: {
		required: false,
		updateable: true,
		dataType: 'NUMBER',
		fieldSize: 'null'
	},
	default_energy_type_id: {
		required: false,
		updateable: true,
		dataType: 'NUMBER',
		fieldSize: 'null'
	},
	default_fuel_grade_id: {
		required: false,
		updateable: true,
		dataType: 'NUMBER',
		fieldSize: 'null'
	},
	note: {
		required: false,
		updateable: true,
		dataType: 'STRING',
		fieldSize: { MIN: 1, MAX: 255 }
	}
};

const fuelPurchaseTableFields = {
	fuel_purchase_id: {
		required: false,
		updateable: false,
		dataType: 'NUMBER',
		fieldSize: 'null'
	},
	user_id: {
		required: false,
		updateable: false,
		dataType: 'NUMBER',
		fieldSize: 'null'
	},
	vehicle_id: {
		required: true,
		updateable: true,
		dataType: 'NUMBER',
		fieldSize: 'null'
	},
	fuel_type_id: {
		required: true,
		updateable: true,
		dataType: 'NUMBER',
		fieldSize: 'null'
	},
	fuel_grade: {
		required: false,
		updateable: true,
		dataType: 'STRING',
		fieldSize: { MIN: 1, MAX: 25 }
	},
	odometer: {
		required: true,
		updateable: true,
		dataType: 'NUMBER',
		fieldSize: 'null'
	},
	amount: {
		required: true,
		updateable: true,
		dataType: 'NUMBER',
		fieldSize: 'null'
	},
	price: {
		required: true,
		updateable: true,
		dataType: 'NUMBER',
		fieldSize: 'null'
	},
	fuel_brand: {
		required: false,
		updateable: true,
		dataType: 'STRING',
		fieldSize: { MIN: 1, MAX: 50 }
	},
	fuel_station: {
		required: false,
		updateable: true,
		dataType: 'STRING',
		fieldSize: { MIN: 1, MAX: 50 }
	},
	partial_tank: {
		required: false,
		updateable: true,
		dataType: 'BOOLEAN',
		fieldSize: 'null'
	},
	missed_prev_fill_up: {
		required: false,
		updateable: true,
		dataType: 'BOOLEAN',
		fieldSize: 'null'
	},
	note: {
		required: false,
		updateable: true,
		dataType: 'STRING',
		fieldSize: { MIN: 1, MAX: 255 }
	},
	date_of_fill_up: {
		required: true,
		updateable: true,
		dataType: 'DATETIME',
		fieldSize: 'null'
	}
};

module.exports = {
	userTableFields,
	vehicleTableFields,
	fuelPurchaseTableFields
};