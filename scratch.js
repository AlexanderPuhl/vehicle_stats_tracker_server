const { userTableFields } = require('./library/tableFields');

function gatherTableUpdateableFields(tableFields) {
	const updateableFields = [];
	for (const property in tableFields) {
		if (tableFields[property].updateable === true) {
			updateableFields.push(property);
		}
	}
	return updateableFields;
}

const updateableFields = gatherTableUpdateableFields(userTableFields);

console.log('updateableFields: ');
console.log(updateableFields);