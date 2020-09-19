'use strict';

function detectInvalidStringField(validStringList, requestBody) {
	return validStringList.find(
		(field) => field in requestBody && typeof requestBody[field] !== 'string',
	);
}

function gatherStringFieldsFromBody(reqBody) {
	const stringFields = {}
	for (const [key, value] of Object.entries(reqBody)) {
		if (typeof (value) === 'string') {
			stringFields[key] = value;
		}
	}
	return stringFields;
}

function detectNonTrimmedStrings(stringFields, stringFieldsFromBody) {
	return stringFields.find(
		(field) => field in stringFieldsFromBody && stringFieldsFromBody[field].trim() !== stringFieldsFromBody[field]
	)
}

function detectStringTooSmall(fieldSizes, stringFieldsFromBody) {
	return Object.keys(fieldSizes).find((field) =>
		field in stringFieldsFromBody &&
		'min' in fieldSizes[field] &&
		stringFieldsFromBody[field].length < fieldSizes[field].min
	)
}

function detectStringTooLarge(fieldSizes, stringFieldsFromBody) {
	return Object.keys(fieldSizes).find(
		(field) =>
			field in stringFieldsFromBody &&
			'max' in fieldSizes[field] &&
			stringFieldsFromBody[field].length > fieldSizes[field].max,
	);
}

function detectInvalidIntField(validNumberList, requestBody) {
	return validNumberList.find(
		(field) => field in requestBody && typeof requestBody[field] !== 'number',
	);
}

function gatherIntFieldsFromBody(reqBody) {
	const intFields = {}
	for (const [key, value] of Object.entries(reqBody)) {
		if (typeof (value) === 'number') {
			intFields[key] = value;
		}
	}
	return intFields;
}

function detectNegativeInt(intFieldsFromBody) {
	for (const [key, value] of Object.entries(intFieldsFromBody)) {
		if (value <= 0) {
			return key
		}
	}
}

module.exports = {
	detectInvalidStringField,
	gatherStringFieldsFromBody,
	detectNonTrimmedStrings,
	detectStringTooSmall,
	detectStringTooLarge,
	detectInvalidIntField,
	gatherIntFieldsFromBody,
	detectNegativeInt
};