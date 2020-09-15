'use strict';

const bcrypt = require('bcryptjs');
const knex = require('../db/knex');
const pg = require('../db/pg');

const { createAuthToken } = require('../library/jwtUtilities');

const {
	detectInvalidStringField,
	detectInvalidIntField,
	gatherStringFieldsFromBody,
	detectNonTrimmedStrings,
	detectStringTooSmall,
	detectStringTooLarge
} = require('../library/requestBodyUtilities');

const { userRequiredFields } = require('../library/tableRequiredFields')
const { userUpdateableFields } = require('../library/tableUpdateableFields');
const { userValidFields } = require('../library/tableValidFields');
const { userStringFields } = require('../library/tableStringFields');
const { userIntFields } = require('../library/tableIntFields');
const { userFieldSizes } = require('../library/tableFieldSizes');

// @desc Login a user
// @route POST /api/user/login
// @access Public
exports.loginUser = (req, res, next) => {
	const authToken = createAuthToken(req.user);
	res.json({ authToken });
}

// @desc Refresh a JWT Token for a logged in user
// @route POST /api/user/refresh
// @access Private
exports.refreshToken = (req, res, next) => {
	const authToken = createAuthToken(req.user);
	res.json({ authToken });
};

// @desc Create in user
// @route POST /api/user/create
// @access Public
exports.createUser = async (req, res, next) => {
	try {
		const requestBodyKeys = Object.keys(req.body);

		//CHECK TO MAKE SURE REQUIRED FIELDS ARE IN THE REQ.BODY
		const missingField = userRequiredFields.find((field) => !(field in req.body));
		if (missingField) {
			const error = new Error(`Missing '${missingField}' in request body.`);
			error.status = 422;
			return next(error);
		}

		//CHECK TO MAKE SURE NO INVALID FIELDS ARE IN THE REQ.BODY
		requestBodyKeys.forEach((key) => {
			if (!userValidFields.includes(key)) {
				const error = new Error(`${key} is not a valid field.`);
				error.status = 400;
				return next(error);
			}
		});

		//CHECK TO MAKE SURE STRING FIELDS ARE ACTUALLY STRINGS
		const invalidStringField = detectInvalidStringField(userStringFields, req.body);
		if (invalidStringField) {
			const error = new Error(`Field: '${invalidStringField}' must be type String.`);
			error.status = 422;
			return next(error);
		}
		const stringFieldsFromBody = gatherStringFieldsFromBody(req.body);

		//CHECK TO MAKE SURE NO LEADING/HANGING WHITE SPACES ARE IN THE STRINGS
		const nonTrimmedField = detectNonTrimmedStrings(userStringFields, stringFieldsFromBody)
		if (nonTrimmedField) {
			const error = new Error(
				`Field: '${nonTrimmedField}' cannot start or end with a whitespace.`,
			);
			error.status = 422;
			return next(error);
		}

		//CHECK TO MAKE SURE STRINGS HAVE THE MINIMUM AMOUNT OF CHARACTERS
		const tooSmallField = detectStringTooSmall(userFieldSizes, stringFieldsFromBody);
		if (tooSmallField) {
			const { min } = userFieldSizes[tooSmallField];
			const error = new Error(
				`Field: '${tooSmallField}' must be at least ${min} characters long.`,
			);
			error.status = 422;
			return next(error);
		}

		//CHECK TO MAKE SURE STRINGS DON'T EXCEED MAXIMUM STRING LENGTH
		const tooLargeField = detectStringTooLarge(userFieldSizes, stringFieldsFromBody);
		if (tooLargeField) {
			const { max } = userFieldSizes[tooLargeField];
			const error = new Error(
				`Field: '${tooLargeField}' must be at most ${max} characters long.`,
			);
			error.status = 422;
			return next(error);
		}

		const {
			username, password, email, name
		} = req.body;

		const { rows } = await pg.query('SELECT * FROM public.user WHERE username = $1 or email = $2', [username, email]);
		if (rows.length === 0) {
			const query = 'INSERT INTO public.user(username, password, email, name) VALUES($1, $2, $3, $4) RETURNING *';
			const hashedPassword = await bcrypt.hash(password, 10);
			const newUser = [username, hashedPassword, email, name];
			const { rows } = await pg.query(query, newUser);
			const result = rows[0];
			const response = {
				"user_id": result.user_id,
				"name": result.name,
				"email": result.email,
				"username": result.username,
				"onboarding": result.onboarding,
				"selected_vehicle_id": result.selected_vehicle_id,
				"reset_token": result.reset_token,
				"reset_token_expiration": result.reset_token_expiration
			}
			res
				.status(201)
				.location(`${req.originalUrl}/${response.user_id}`)
				.json(response);
		} else {
			const error = new Error('The username or email already exists.');
			error.status = 400;
			error.reason = 'ValidationError';
			next(error);
		}
	} catch (error) {
		next(error);
	}
};

// @desc Update a user
// @route POST /api/user/update
// @access Private
exports.updateUser = (req, res, next) => {
	const requestBodyKeys = Object.keys(req.body);

	//CHECK TO MAKE SURE NO INVALID FIELDS ARE IN THE REQ.BODY
	requestBodyKeys.forEach((key) => {
		if (!userUpdateableFields.includes(key)) {
			const error = new Error(`${key} is not a valid field.`);
			error.status = 400;
			return next(error);
		}
	});

	//CHECK TO MAKE SURE UPDATEABLE FIELDS ARE IN THE REQ.BODY
	requestBodyKeys.forEach((key) => {
		if (!userUpdateableFields.includes(key)) {
			const error = new Error(`${key} is not an updateable field.`);
			error.status = 400;
			return next(error);
		}
	});

	//CHECK TO MAKE SURE INT FIELDS ARE ACTUALLY NUMBERS
	const nonIntField = detectInvalidIntField(userIntFields, req.body)
	if (nonIntField) {
		const error = new Error(`Field: '${nonIntField}' must be type Int.`);
		error.status = 422;
		return next(error);
	}

	//CHECK TO MAKE SURE STRING FIELDS ARE ACTUALLY STRINGS
	const invalidStringField = detectInvalidStringField(userStringFields, req.body);
	if (invalidStringField) {
		const error = new Error(`Field: '${invalidStringField}' must be type String.`);
		error.status = 422;
		return next(error);
	}

	const stringFieldsFromBody = gatherStringFieldsFromBody(req.body);

	//CHECK TO MAKE SURE NO LEADING/HANGING WHITE SPACES ARE IN THE STRINGS
	if (JSON.stringify(stringFieldsFromBody) !== '{}') {
		const nonTrimmedField = detectNonTrimmedStrings(userStringFields, stringFieldsFromBody)
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
		const tooSmallField = detectStringTooSmall(userFieldSizes, stringFieldsFromBody);
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
		const tooLargeField = detectStringTooLarge(userFieldSizes, stringFieldsFromBody);
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
	const toUpdate = {};

	userUpdateableFields.forEach((field) => {
		if (field in req.body) {
			toUpdate[field] = req.body[field];
		}
	});

	toUpdate.modified_on = new Date(Date.now()).toISOString();

	knex('user')
		.returning("*")
		.where({ user_id: userId })
		.update(toUpdate)
		.then(results => {
			const result = results[0];
			const user = {};
			for (const property in result) {
				user[property] = result[property];
			}
			delete user.password;
			res.status(200).json(user);
		})
		.catch(error => {
			next(error);
		});
};

// @desc Delete a user
// @route POST /api/user/delete
// @access Private
exports.deleteUser = async (req, res, next) => {
	try {
		const { userId } = req.user.user_id;
		const { rowCount } = await pg.query('DELETE FROM public.user WHERE user_id = $1', [userId]);
		if (rowCount === 1) {
			res
				.status(200)
				.json({ message: 'User account deleted.' });
		}
	} catch (error) {
		next(error);
	}
}

//****************************************************************************************************************//
//******************************************//TEST UTILITY CONTROLLERS//******************************************//
//****************************************************************************************************************//
exports.findOne = async (username) => {
	try {
		const { rows } = await pg.query('select * from public.user WHERE username = $1', [username]);
		return rows[0];
	} catch (error) {
		return error;
	}
}