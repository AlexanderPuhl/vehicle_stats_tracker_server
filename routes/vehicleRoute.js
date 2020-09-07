'use strict';

const express = require('express');
const router = express.Router();

const knex = require('../db/knexConfig');

const {
	detectInvalidIntField,
	gatherIntFieldsFromBody,
	detectNegativeInt,
	detectInvalidStringField,
	gatherStringFieldsFromBody,
	detectNonTrimmedStrings,
	detectStringTooSmall,
	detectStringTooLarge
} = require('../library/requestBodyUtilities');

const { vehicleRequiredFields } = require('../library/tableRequiredFields');
const { vehicleUpdateableFields } = require('../library/tableUpdateableFields');
const { vehicleValidFields } = require('../library/tableValidFields');
const { vehicleStringFields } = require('../library/tableStringFields');
const { vehicleIntFields } = require('../library/tableIntFields');
const { vehicleFieldSizes } = require('../library/tableFieldSizes');

router.get('/', (req, res, next) => {
	const userId = req.user.user_id;
	
	knex
		.select()
		.table('vehicle')
		.where({ user_id: userId })
		.orderBy('name')
		.then(results => {
			res.json(results)
		})
		.catch(error => {
			next(error);
		});
});

router.get('/:vehicleId', (req, res, next) => {
	const userId = req.user.user_id;
	const { vehicleId } = req.params;

	knex
		.select()
		.table('vehicle')
		.where({
			user_id: userId,
			vehicle_id: vehicleId
		})
		.then(results => {
			res.json(results)
		})
		.catch(error => {
			next(error);
		});
});

router.post('/', (req, res, next) => {
	const requestBodyKeys = Object.keys(req.body);

	//CHECK TO MAKE SURE REQUIRED FIELDS ARE IN THE REQ.BODY
	vehicleRequiredFields.forEach((field) => {
		if (!requestBodyKeys.includes(field)) {
			const error = new Error(`${field} is required.`);
			error.status = 400;
			return next(error);
		}
	});

	//CHECK TO MAKE SURE NO INVALID FIELDS ARE IN THE REQ.BODY
	requestBodyKeys.forEach((key) => {
		if (!vehicleValidFields.includes(key)) {
			const error = new Error(`${key} is not a valid field.`);
			error.status = 400;
			return next(error);
		}
	});

	//CHECK TO MAKE SURE INT FIELDS ARE ACTUALLY NUMBERS
	const nonIntField = detectInvalidIntField(vehicleIntFields, req.body)
	if (nonIntField) {
		const error = new Error(`Field: '${nonIntField}' must be type Int.`);
		error.status = 422;
		return next(error);
	}

	//CHECK TO MAKE SURE STRING FIELDS ARE ACTUALLY STRINGS
	const invalidStringField = detectInvalidStringField(vehicleStringFields, req.body);
	if (invalidStringField) {
		const error = new Error(`Field: '${invalidStringField}' must be type String.`);
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
	const tooSmallField = detectStringTooSmall(vehicleFieldSizes, stringFieldsFromBody);
	if (tooSmallField) {
		const { min } = vehicleFieldSizes[tooSmallField];
		const error = new Error(
			`Field: '${tooSmallField}' must be at least ${min} characters long.`,
		);
		error.status = 422;
		return next(error);
	}

	//CHECK TO MAKE SURE STRINGS DON'T EXCEED MAXIMUM STRING LENGTH
	const tooLargeField = detectStringTooLarge(vehicleFieldSizes, stringFieldsFromBody);
	if (tooLargeField) {
		const { max } = vehicleFieldSizes[tooLargeField];
		const error = new Error(
			`Field: '${tooLargeField}' must be at most ${max} characters long.`,
		);
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
		.returning('vehicle_id')
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
});

router.put('/:vehicleId', (req, res, next) => {
	const requestBodyKeys = Object.keys(req.body);

	//CHECK TO MAKE SURE NO INVALID FIELDS ARE IN THE REQ.BODY
	requestBodyKeys.forEach((key) => {
		if (!vehicleValidFields.includes(key)) {
			const error = new Error(`${key} is not a valid field.`);
			error.status = 400;
			return next(error);
		}
	});

	//CHECK TO MAKE SURE UPDATEABLE FIELDS ARE IN THE REQ.BODY
	requestBodyKeys.forEach((key) => {
		if (!vehicleUpdateableFields.includes(key)) {
			const error = new Error(`${key} is not an updateable field.`);
			error.status = 400;
			return next(error);
		}
	});

	//CHECK TO MAKE SURE INT FIELDS ARE ACTUALLY NUMBERS
	const nonIntField = detectInvalidIntField(vehicleIntFields, req.body)
	if (nonIntField) {
		const error = new Error(`Field: '${nonIntField}' must be type Int.`);
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

	//CHECK TO MAKE SURE STRING FIELDS ARE ACTUALLY STRINGS
	const nonStringField = detectInvalidStringField(vehicleStringFields, req.body);
	if (nonStringField) {
		const error = new Error(`Field: '${nonStringField}' must be type String.`);
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
		const tooSmallField = detectStringTooSmall(vehicleFieldSizes, stringFieldsFromBody);
		if (tooSmallField) {
			const { min } = userFieldSizes[tooSmallField];
			const error = new Error(
				`Field: '${tooSmallField}' must be at least ${min} characters long.`,
			);
			error.status = 422;
			return next(error);
		}
	}

	//CHECK TO MAKE SURE STRINGS DON'T EXCEED MAXIMUM STRING LENGTH
	if (JSON.stringify(stringFieldsFromBody) !== '{}') {
		const tooLargeField = detectStringTooLarge(vehicleFieldSizes, stringFieldsFromBody);
		if (tooLargeField) {
			const { max } = userFieldSizes[tooLargeField];
			const error = new Error(
				`Field: '${tooLargeField}' must be at most ${max} characters long.`,
			);
			error.status = 422;
			return next(error);
		}
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
		.returning('vehicle_id')
		.where({
			user_id: userId,
			vehicle_id: vehicleId
		})
		.update(toUpdate)
		.then(results => {
			const result = results[0];
			res
				.status(201)
				.location(`${req.originalUrl}/${result.fuel_purchase_id}`)
				.json(result);
		})
		.catch(error => {
			next(error);
		});
});

router.delete('/:vehicleId', (req, res, next) => {
	const { vehicleId } = req.params;

	knex('vehicle')
		.where('vehicle_id', vehicleId)
		.del()
		.then(result => {
			res.sendStatus(204)
		})
		.catch(error => {
			next(error);
		});
});

module.exports = router;
