'use strict';

const knex = require('../db/knex');
const pg = require('../db/pg');

const {
	detectInvalidStringField,
	gatherStringFieldsFromBody,
	detectNonTrimmedStrings,
	detectStringTooSmall,
	detectStringTooLarge,
	detectInvalidIntField,
	gatherIntFieldsFromBody,
	detectNegativeInt,
} = require('../library/requestBodyUtilities');

const { vehicleRequiredFields } = require('../library/tableRequiredFields');
const { vehicleUpdateableFields } = require('../library/tableUpdateableFields');
const { vehicleValidFields } = require('../library/tableValidFields');
const { vehicleStringFields } = require('../library/tableStringFields');
const { vehicleIntFields } = require('../library/tableIntFields');
const { vehicleFieldSizes } = require('../library/tableFieldSizes');

// @desc Get all vehicles
// @route Get /api/vehicle
// @access Private
exports.getAllVehicles = async (req, res, next) => {
	try {
		const userId = req.user.user_id;
		const { rows } = await pg.query('SELECT * FROM vehicle WHERE user_id = $1', [userId]);
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
}

// @desc Get a vehicles
// @route Get /api/vehicle/:vehicleId
// @access Private
exports.getOneVehicle = async (req, res, next) => {
	try {
		const userId = req.user.user_id;
		const { vehicleId } = req.params;
		const { rows } = await pg.query('SELECT * FROM vehicle WHERE user_id = $1 AND vehicle_id = $2', [userId, vehicleId]);
		const vehicle = rows[0];
		res.status(200).json(vehicle);
	} catch (error) {
		next(error);
	}
}

// @desc Create a vehicles
// @route POST /api/vehicle/
// @access Private
exports.createVehicle = async (req, res, next) => {
	try {
		const requestBodyKeys = Object.keys(req.body);

		//CHECK TO MAKE SURE NO INVALID FIELDS ARE IN THE REQ.BODY
		requestBodyKeys.forEach((key) => {
			if (!vehicleValidFields.includes(key)) {
				const error = new Error(`${key} is not a valid field.`);
				error.status = 422;
				return next(error);
			}
		});

		//CHECK TO MAKE SURE REQUIRED FIELDS ARE IN THE REQ.BODY
		vehicleRequiredFields.forEach((field) => {
			if (!requestBodyKeys.includes(field)) {
				const error = new Error(`${field} is required.`);
				error.status = 422;
				return next(error);
			}
		});

		//CHECK TO MAKE SURE STRING FIELDS ARE ACTUALLY STRINGS
		const invalidStringField = detectInvalidStringField(vehicleStringFields, req.body);
		if (invalidStringField) {
			const error = new Error(`Field: '${invalidStringField}' must be a string.`);
			error.status = 422;
			return next(error);
		}
		const stringFieldsFromBody = gatherStringFieldsFromBody(req.body);

		//CHECK TO MAKE SURE NO LEADING/HANGING WHITE SPACES ARE IN THE STRINGS
		const nonTrimmedField = detectNonTrimmedStrings(vehicleStringFields, stringFieldsFromBody)

		if (nonTrimmedField) {
			const error = new Error(
				`Field: '${nonTrimmedField}' cannot start or end with a whitespace.`,
			);
			error.status = 422;
			return next(error);
		}

		//CHECK TO MAKE SURE STRINGS HAVE THE MINIMUM AMOUNT OF CHARACTERS
		const fieldTooSmall = detectStringTooSmall(vehicleFieldSizes, stringFieldsFromBody);
		if (fieldTooSmall) {
			const { min } = vehicleFieldSizes[fieldTooSmall];
			const characterString = min === 1 ? 'character' : 'characters';
			const error = new Error(
				`Field: '${fieldTooSmall}' must be at least ${min} ${characterString} long.`,
			);
			error.status = 422;
			return next(error);
		}

		//CHECK TO MAKE SURE STRINGS DON'T EXCEED MAXIMUM STRING LENGTH
		const fieldTooLarge = detectStringTooLarge(vehicleFieldSizes, stringFieldsFromBody);
		if (fieldTooLarge) {
			const { max } = vehicleFieldSizes[fieldTooLarge];
			const error = new Error(
				`Field: '${fieldTooLarge}' must be at most ${max} characters long.`,
			);
			error.status = 422;
			return next(error);
		}

		//CHECK TO MAKE SURE INT FIELDS ARE ACTUALLY NUMBERS
		const nonIntField = detectInvalidIntField(vehicleIntFields, req.body)
		if (nonIntField) {
			const error = new Error(`Field: '${nonIntField}' must be a number.`);
			error.status = 422;
			return next(error);
		}
		const intFieldsFromBody = gatherIntFieldsFromBody(req.body);

		// //CHECK TO MAKE SURE INT FIELDS ARE POSITIVE NUMBERS
		const negativeInt = detectNegativeInt(intFieldsFromBody);
		if (negativeInt) {
			const error = new Error(`Field: '${negativeInt}' must be a positive number.`);
			error.status = 422;
			return next(error);
		}

		const user_id = req.user.user_id;
		const newVehicle = { user_id }

		for (const [key, value] of Object.entries(req.body)) {
			newVehicle[key] = value;
		}

		knex
			.insert(newVehicle)
			.into('vehicle')
			.returning('*')
			.then(result => {
				const results = result[0];
				res
					.status(201)
					.location(`${req.originalUrl}/${results.vehicle_id}`)
					.json(results);
			})
			.catch(error => {
				next(error);
			});
	} catch (error) {
		next(error);
	}
}

// @desc Update a vehicles
// @route Put /api/vehicle/:vehicleId
// @access Private
exports.updateVehicle = (req, res, next) => {
	const requestBodyKeys = Object.keys(req.body);

	//CHECK TO MAKE SURE UPDATEABLE FIELDS ARE IN THE REQ.BODY
	requestBodyKeys.forEach((key) => {
		if (!vehicleUpdateableFields.includes(key)) {
			const error = new Error(`'${key}' is not an updateable field.`);
			error.status = 422;
			return next(error);
		}
	});

	//CHECK TO MAKE SURE STRING FIELDS ARE ACTUALLY STRINGS
	const nonStringField = detectInvalidStringField(vehicleStringFields, req.body);
	if (nonStringField) {
		const error = new Error(`Field: '${nonStringField}' must be a string.`);
		error.status = 422;
		return next(error);
	}
	const stringFieldsFromBody = gatherStringFieldsFromBody(req.body);

	//CHECK TO MAKE SURE NO LEADING/HANGING WHITE SPACES ARE IN THE STRINGS
	if (JSON.stringify(stringFieldsFromBody) !== '{}') {
		const nonTrimmedField = detectNonTrimmedStrings(vehicleStringFields, stringFieldsFromBody)
		if (nonTrimmedField) {
			const error = new Error(
				`Field: '${nonTrimmedField}' cannot start or end with a whitespace.`,
			);
			error.status = 422;
			return next(error);
		}
	}

	//CHECK TO MAKE SURE STRINGS HAVE THE MINIMUM AMOUNT OF CHARACTERS
	if (JSON.stringify(stringFieldsFromBody) !== '{}') {
		const fieldTooSmall = detectStringTooSmall(vehicleFieldSizes, stringFieldsFromBody);
		if (fieldTooSmall) {
			const { min } = vehicleFieldSizes[fieldTooSmall];
			const characterString = min === 1 ? 'character' : 'characters';
			const error = new Error(
				`Field: '${fieldTooSmall}' must be at least ${min} ${characterString} long.`,
			);
			error.status = 422;
			return next(error);
		}
	}

	//CHECK TO MAKE SURE STRINGS DON'T EXCEED MAXIMUM STRING LENGTH
	if (JSON.stringify(stringFieldsFromBody) !== '{}') {
		const fieldTooLarge = detectStringTooLarge(vehicleFieldSizes, stringFieldsFromBody);
		if (fieldTooLarge) {
			const { max } = vehicleFieldSizes[fieldTooLarge];
			const error = new Error(
				`Field: '${fieldTooLarge}' must be at most ${max} characters long.`,
			);
			error.status = 422;
			return next(error);
		}
	}

	//CHECK TO MAKE SURE INT FIELDS ARE ACTUALLY NUMBERS
	const nonIntField = detectInvalidIntField(vehicleIntFields, req.body)
	if (nonIntField) {
		const error = new Error(`Field: '${nonIntField}' must be a number.`);
		error.status = 422;
		return next(error);
	}
	const intFieldsFromBody = gatherIntFieldsFromBody(req.body);

	// //CHECK TO MAKE SURE INT FIELDS ARE POSITIVE NUMBERS
	const negativeInt = detectNegativeInt(intFieldsFromBody);
	if (negativeInt) {
		const error = new Error(`Field: '${negativeInt}' must be a positive number.`);
		error.status = 422;
		return next(error);
	}

	const userId = req.user.user_id;
	const { vehicleId } = req.params;
	const toUpdate = {};

	vehicleUpdateableFields.forEach((field) => {
		if (field in req.body) {
			toUpdate[field] = req.body[field];
		}
	});

	toUpdate.modified_on = new Date(Date.now()).toISOString();

	knex('vehicle')
		.returning('*')
		.where({
			user_id: userId,
			vehicle_id: vehicleId
		})
		.update(toUpdate)
		.then(results => {
			const result = results[0];
			res
				.status(200)
				.location(`${req.originalUrl}/${result.fuel_purchase_id}`)
				.json(result);
		})
		.catch(error => {
			next(error);
		});
}

// @desc Delete a vehicles
// @route Delete /api/vehicle/:vehicleId
// @access Private
exports.deleteVehicle = async (req, res, next) => {
	try {
		const { vehicleId } = req.params;

		// //CHECK TO MAKE SURE VEHICLE_ID IS A NUMBER
		if (isNaN(vehicleId)) {
			const error = new Error(`Invalid vehicleId.`);
			error.status = 400;
			return next(error);
		}

		const { rowCount } = await pg.query('DELETE FROM vehicle WHERE vehicle_id = $1', [vehicleId]);
		if (rowCount === 1) {
			res
				.status(200)
				.json({ message: 'Vehicle deleted.' });
		} else {
			const error = new Error(
				`Could not find vehicle with vehicle_id: ${vehicleId}.`
			);
			error.status = 406;
			return next(error);
		}
	} catch (error) {
		next(error);
	}
}
