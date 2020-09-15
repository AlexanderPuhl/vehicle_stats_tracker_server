var environment = process.env.NODE_ENV || 'development';
var config = require('./knexDbConnections.js')[environment];

module.exports = require('knex')(config);