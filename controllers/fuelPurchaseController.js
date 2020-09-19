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

const { fuelPurchaseRequiredFields } = require('../library/tableRequiredFields');
const { fuelPurchaseUpdateableFields } = require('../library/tableUpdateableFields');
const { fuelPurchaseValidFields } = require('../library/tableValidFields');
const { fuelPurchaseStringFields } = require('../library/tableStringFields');
const { fuelPurchaseIntFields } = require('../library/tableIntFields');
const { fuelPurchaseFieldSizes } = require('../library/tableFieldSizes');

// @desc Get all fuel purchases
// @route Get /api/fuel_purchase
// @access Private
exports.getAllFuelPurchases = async (req, res, next) => {
	try {
		const userId = req.user.user_id;
		const { rows } = await pg.query('SELECT * FROM fuel_purchase WHERE user_id = $1 ORDER BY created_on', [userId]);
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
}

// @desc Get a fuel purchase
// @route Get /api/fuel_purchase/:fuelPurchaseId
// @access Private
exports.getOneFuelPurchase = async (req, res, next) => {
	try {
		const userId = req.user.user_id;
		const { fuelPurchaseId } = req.params;
		const { rows } = await pg.query('SELECT * FROM fuel_purchase WHERE user_id = $1 AND fuel_purchase_id = $2', [userId, fuelPurchaseId]);
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
}

// @desc Create a fuel purchase
// @route Post /api/fuel_purchase
// @access Private
exports.createFuelPurchase = async (req, res, next) => {
	const requestBodyKeys = Object.keys(req.body);

	//CHECK TO MAKE SURE NO INVALID FIELDS ARE IN THE REQ.BODY
	requestBodyKeys.forEach((key) => {
		if (!fuelPurchaseValidFields.includes(key)) {
			const error = new Error(`'${key}' is not a valid field.`);
			error.status = 422;
			return next(error);
		}
	});

	//CHECK TO MAKE SURE REQUIRED FIELDS ARE IN THE REQ.BODY
	fuelPurchaseRequiredFields.forEach((field) => {
		if (!requestBodyKeys.includes(field)) {
			const error = new Error(`'${field}' is required.`);
			error.status = 422;
			return next(error);
		}
	});

	//CHECK TO MAKE SURE STRING FIELDS ARE ACTUALLY STRINGS
	const invalidStringField = detectInvalidStringField(fuelPurchaseStringFields, req.body);
	if (invalidStringField) {
		const error = new Error(`Field: '${invalidStringField}' must be a string.`);
		error.status = 422;
		return next(error);
	}
	const stringFieldsFromBody = gatherStringFieldsFromBody(req.body);

	//CHECK TO MAKE SURE NO LEADING/HANGING WHITE SPACES ARE IN THE STRINGS
	const nonTrimmedField = detectNonTrimmedStrings(fuelPurchaseStringFields, stringFieldsFromBody)
	if (nonTrimmedField) {
		const error = new Error(
			`Field: '${nonTrimmedField}' cannot start or end with a whitespace.`,
		);
		error.status = 422;
		return next(error);
	}

	//CHECK TO MAKE SURE STRINGS HAVE THE MINIMUM AMOUNT OF CHARACTERS
	const fieldTooSmall = detectStringTooSmall(fuelPurchaseFieldSizes, stringFieldsFromBody);
	if (fieldTooSmall) {
		const { min } = fuelPurchaseFieldSizes[fieldTooSmall];
		const characterString = min === 1 ? 'character' : 'characters';
		const error = new Error(
			`Field: '${fieldTooSmall}' must be at least ${min} ${characterString} long.`,
		);
		error.status = 422;
		return next(error);
	}

	//CHECK TO MAKE SURE STRINGS DON'T EXCEED MAXIMUM STRING LENGTH
	const fieldTooLarge = detectStringTooLarge(fuelPurchaseFieldSizes, stringFieldsFromBody);
	if (fieldTooLarge) {
		const { max } = fuelPurchaseFieldSizes[fieldTooLarge];
		const error = new Error(
			`Field: '${fieldTooLarge}' must be at most ${max} characters long.`,
		);
		error.status = 422;
		return next(error);
	}

	//CHECK TO MAKE SURE INT FIELDS ARE ACTUALLY NUMBERS
	const nonIntField = detectInvalidIntField(fuelPurchaseIntFields, req.body)
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
	const newFuelPurchase = { user_id };

	for (const [key, value] of Object.entries(req.body)) {
		newFuelPurchase[key] = value;
	}

	knex
		.insert(newFuelPurchase)
		.into('fuel_purchase')
		.returning('*')
		.then(result => {
			const results = result[0];
			res
				.status(201)
				.location(`${req.originalUrl}/${results.fuel_purchase_id}`)
				.json(results);
		})
		.catch(error => {
			next(error);
		});
}

// @desc Update a fuel purchase
// @route PUT /api/fuel_purchase/:fuelPurchaseId
// @access Private
exports.updateFuelPurchase = (req, res, next) => {
	const requestBodyKeys = Object.keys(req.body);

	//CHECK TO MAKE SURE UPDATEABLE FIELDS ARE IN THE REQ.BODY
	requestBodyKeys.forEach((key) => {
		if (!fuelPurchaseUpdateableFields.includes(key)) {
			const error = new Error(`'${key}' is not an updateable field.`);
			error.status = 422;
			return next(error);
		}
	});

	//CHECK TO MAKE SURE STRING FIELDS ARE ACTUALLY STRINGS
	const invalidStringField = detectInvalidStringField(fuelPurchaseStringFields, req.body);
	if (invalidStringField) {
		const error = new Error(`Field: '${invalidStringField}' must be a string.`);
		error.status = 422;
		return next(error);
	}
	const stringFieldsFromBody = gatherStringFieldsFromBody(req.body);

	//CHECK TO MAKE SURE NO LEADING/HANGING WHITE SPACES ARE IN THE STRINGS
	const nonTrimmedField = detectNonTrimmedStrings(fuelPurchaseStringFields, stringFieldsFromBody)

	if (nonTrimmedField) {
		const error = new Error(
			`Field: '${nonTrimmedField}' cannot start or end with a whitespace.`,
		);
		error.status = 422;
		return next(error);
	}

	//CHECK TO MAKE SURE STRINGS HAVE THE MINIMUM AMOUNT OF CHARACTERS
	const fieldTooSmall = detectStringTooSmall(fuelPurchaseFieldSizes, stringFieldsFromBody);
	if (fieldTooSmall) {
		const { min } = fuelPurchaseFieldSizes[fieldTooSmall];
		const characterString = min === 1 ? 'character' : 'characters';
		const error = new Error(
			`Field: '${fieldTooSmall}' must be at least ${min} ${characterString} long.`,
		);
		error.status = 422;
		return next(error);
	}

	//CHECK TO MAKE SURE STRINGS DON'T EXCEED MAXIMUM STRING LENGTH
	const fieldTooLarge = detectStringTooLarge(fuelPurchaseFieldSizes, stringFieldsFromBody);
	if (fieldTooLarge) {
		const { max } = fuelPurchaseFieldSizes[fieldTooLarge];
		const error = new Error(
			`Field: '${fieldTooLarge}' must be at most ${max} characters long.`,
		);
		error.status = 422;
		return next(error);
	}

	//CHECK TO MAKE SURE INT FIELDS ARE ACTUALLY NUMBERS
	const nonIntField = detectInvalidIntField(fuelPurchaseIntFields, req.body)
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
	const { fuelPurchaseId } = req.params;
	const toUpdate = {};

	fuelPurchaseUpdateableFields.forEach((field) => {
		if (field in req.body) {
			toUpdate[field] = req.body[field];
		}
	});

	toUpdate.modified_on = new Date(Date.now()).toISOString();

	knex('fuel_purchase')
		.returning('*')
		.where({
			user_id: userId,
			fuel_purchase_id: fuelPurchaseId
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

// @desc Delete a fuel purchase
// @route DELETE /api/fuel_purchase/:fuelPurchaseId
// @access Private
exports.deleteFuelPurchase = async (req, res, next) => {
	try {
		const { fuelPurchaseId } = req.params;

		// //CHECK TO MAKE SURE FUEL_PURCHASE_ID IS A NUMBER
		if (isNaN(fuelPurchaseId)) {
			const error = new Error(`Invalid fuel purchase id.`);
			error.status = 400;
			return next(error);
		}

		const { rowCount } = await pg.query('DELETE FROM fuel_purchase WHERE fuel_purchase_id = $1', [fuelPurchaseId]);
		if (rowCount === 1) {
			res
				.status(204)
				.json({ message: 'Fuel purchase deleted.' });
		} else {
			const error = new Error(
				`Could not find a fuel purchase with fuel_purchase_id: ${fuelPurchaseId}.`
			);
			error.status = 406;
			return next(error);
		}
	} catch (error) {
		next(error);
	}
}