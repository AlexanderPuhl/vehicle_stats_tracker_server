const knex = require('../db/knexConfig');
const bcrypt = require('bcryptjs');

const { createAuthToken, issueJWT } = require('../library/jwtUtilities');

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
exports.createUser = (req, res, next) => {
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
		const error = new Error(`Field: '${nonStringField}' must be type String.`);
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

	knex
		.select('email')
		.from('user')
		.where('email', email)
		.then(rows => {
			if (rows.length === 0) {
				const hashedPassword = new Promise((resolve, reject) => {
					resolve(bcrypt.hash(password, 10));
				});

				hashedPassword.then(hashedPW => {
					const newUser = { username, name, email, password: hashedPW };
					knex
						.insert(newUser)
						.into('user')
						.returning('user_id')
						.then(results => {
							const result = results[0];
							res
								.status(201)
								.location(`${req.originalUrl}/${result.user_id}`)
								.json(result);
						})
						.catch(error => {
							next(error);
						});
				});
			} else {
				const newlyCreatedError = new Error('user already exists!');
				res
					.status(401)
					.location(`${req.originalUrl}`)
					.json(newlyCreatedError.message);
			}
		})
		.catch(error => {
			next(error);
		});
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
		.returning("user_id")
		.where({ user_id: userId })
		.update(toUpdate)
		.then(results => {
			res.status(200).json(results);
		})
		.catch(error => {
			next(error);
		});
};

// @desc Delete a user
// @route POST /api/user/delete
// @access Private
exports.deleteUser = (req, res, next) => {
	const userId = req.user.user_id;
	knex('user')
		.where('user_id', userId)
		.del()
		.then(result => {
			res.sendStatus(204)
		})
		.catch(error => {
			next(error);
		});
}
