process.env.NODE_ENV = 'test';

const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const server = require('../server');
const knex = require('../db/knex');
const { JWT_SECRET, JWT_EXPIRATION } = require('../config');
const { userController } = require('../controllers');

chai.use(chaiHttp);

describe('Fuel Purchase API Resources'.cyan.bold.underline, async () => {
	let jwtPayload = {
		user_id: 1,
		username: 'demo',
		email: 'demo@demo.com',
		iat: Date.now()
	};

	let validUser = {};
	let authToken;

	beforeEach(() => {
		return knex.migrate.rollback()
			.then(() => knex.migrate.latest())
			.then(() => knex.seed.run())
			.then(async () => {
				validUser = await userController.findOne('demo');
			})
			.then(() => {
				authToken = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: JWT_EXPIRATION, algorithm: 'HS256' });
			});
	});

	afterEach(() => knex.migrate.rollback());

	describe('api/fuel_purchase'.cyan.bold, () => {
		describe('GET'.green, () => {
			it('Should return all existing fuel purchases for a user.'.cyan, async () => {
				const response = await chai
					.request(server)
					.get('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`);
				const fuelPurchase = response.body[0];
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object')
				expect(fuelPurchase).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
			});

			it.skip('Should return all existing fuel purchases for a vehicle.'.cyan, async () => {
				expect(1).to.equal(2);
			});

			it('Should return a specific fuel purchases for a vehicle.'.cyan, async () => {
				const getAllResponse = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(getAllResponse).to.be.json;
				expect(getAllResponse).to.have.status(200);
				expect(getAllResponse.body).to.be.an('array');
				expect(getAllResponse.body[0]).to.be.an('object');
				expect(getAllResponse.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = getAllResponse.body[0].vehicle_id;

				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('Authorization', `Bearer ${authToken}`);
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
			});

		});

		describe('POST'.yellow, () => {
			it('Should reject a new fuel purchase if the JWT token is missing.'.cyan, async () => {
				const newFuelPurchase = {
					vehicle_id: 2,
					fuel_type_id: 1,
					fuel_grade: '85',
					odometer: 1200,
					amount: 14,
					price: 3,
					fuel_brand: 'Chevron Plus',
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(401);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('name', 'message', 'status');
				expect(response.body.status).to.equal(401);
				expect(response.body.message).to.equal('Unauthorized');
				expect(response.body.name).to.equal('AuthenticationError');
			});

			it('Should reject a new fuel purchase if the JWT token is invalid.'.cyan, async () => {
				const newFuelPurchase = {
					vehicle_id: 2,
					fuel_type_id: 1,
					fuel_grade: '85',
					odometer: 1200,
					amount: 14,
					price: 3,
					fuel_brand: 'Chevron Plus',
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer` + 'Invalid Token')
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(401);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('name', 'message', 'status');
				expect(response.body.status).to.equal(401);
				expect(response.body.message).to.equal('Unauthorized');
				expect(response.body.name).to.equal('AuthenticationError');
			});

			it('Should reject a new fuel purchases if there is an invalid field.'.cyan, async () => {
				const invalidField = 'invalidField';
				const newFuelPurchase = {
					vehicle_id: 2,
					fuel_type_id: 1,
					fuel_grade: '85',
					odometer: 1200,
					amount: 14,
					price: 3,
					fuel_brand: 'Chevron Plus',
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843",
					invalidField
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`'invalidField' is not a valid field.`);
			});

			it('Should reject a new fuel purchases if the vehicle_id is missing.'.cyan, async () => {
				const newFuelPurchase = {
					fuel_type_id: 1,
					fuel_grade: '85',
					odometer: 1200,
					amount: 14,
					price: 3,
					fuel_brand: 'Chevron Plus',
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`'vehicle_id' is required.`);
			});

			it('Should reject a new fuel purchases if the fuel_type_id is missing.'.cyan, async () => {
				const newFuelPurchase = {
					vehicle_id: 1,
					fuel_grade: '85',
					odometer: 1200,
					amount: 14,
					price: 3,
					fuel_brand: 'Chevron Plus',
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`'fuel_type_id' is required.`);
			});

			it('Should reject a new fuel purchases if the odometer is missing.'.cyan, async () => {
				const newFuelPurchase = {
					vehicle_id: 1,
					fuel_type_id: 1,
					fuel_grade: '85',
					amount: 14,
					price: 3,
					fuel_brand: 'Chevron Plus',
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`'odometer' is required.`);
			});

			it('Should reject a new fuel purchases if the amount is missing.'.cyan, async () => {
				const newFuelPurchase = {
					vehicle_id: 1,
					fuel_type_id: 1,
					odometer: 1200,
					fuel_grade: '85',
					price: 3,
					fuel_brand: 'Chevron Plus',
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`'amount' is required.`);
			});

			it('Should reject a new fuel purchases if the price is missing.'.cyan, async () => {
				const newFuelPurchase = {
					vehicle_id: 1,
					fuel_type_id: 1,
					odometer: 1200,
					fuel_grade: '85',
					amount: 14,
					fuel_brand: 'Chevron Plus',
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`'price' is required.`);
			});

			it('Should reject a new fuel purchases if the date_of_fill_up is missing.'.cyan, async () => {
				const newFuelPurchase = {
					vehicle_id: 1,
					fuel_type_id: 1,
					odometer: 1200,
					fuel_grade: '85',
					price: 3,
					amount: 14,
					fuel_brand: 'Chevron Plus',
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`'date_of_fill_up' is required.`);
			});

			it('Should reject a new fuel purchases if fuel_grade is not a string.'.cyan, async () => {
				const nonStringField = 5;
				const newFuelPurchase = {
					vehicle_id: 2,
					fuel_type_id: 1,
					fuel_grade: nonStringField,
					odometer: 1200,
					amount: 14,
					price: 3,
					fuel_brand: 'Chevron Plus',
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'fuel_grade' must be a string.`);
			});

			it('Should reject a new fuel purchases if fuel_brand is not a string.'.cyan, async () => {
				const nonStringField = 5;
				const newFuelPurchase = {
					vehicle_id: 2,
					fuel_type_id: 1,
					fuel_grade: '85',
					odometer: 1200,
					amount: 14,
					price: 3,
					fuel_brand: nonStringField,
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'fuel_brand' must be a string.`);
			});

			it('Should reject a new fuel purchases if fuel_station is not a string.'.cyan, async () => {
				const nonStringField = 5;
				const newFuelPurchase = {
					vehicle_id: 2,
					fuel_type_id: 1,
					fuel_grade: '85',
					odometer: 1200,
					amount: 14,
					price: 3,
					fuel_brand: 'Chevron',
					fuel_station: nonStringField,
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'fuel_station' must be a string.`);
			});

			it('Should reject a new fuel purchases if note is not a string.'.cyan, async () => {
				const nonStringField = 5;
				const newFuelPurchase = {
					vehicle_id: 2,
					fuel_type_id: 1,
					fuel_grade: '85',
					odometer: 1200,
					amount: 14,
					price: 3,
					fuel_brand: 'Chevron',
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: nonStringField,
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'note' must be a string.`);
			});

			it('Should reject a new fuel purchases if a string field starts or ends with whitespaces.'.cyan, async () => {
				const nonTrimmedField = '   85';
				const newFuelPurchase = {
					vehicle_id: 2,
					fuel_type_id: 1,
					fuel_grade: nonTrimmedField,
					odometer: 1200,
					amount: 14,
					price: 3,
					fuel_brand: 'Chevron Plus',
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'fuel_grade' cannot start or end with a whitespace.`);
			});

			it('Should reject a new fuel purchases if fuel_grade doens\'t have at least 1 character.'.cyan, async () => {
				const emptyString = '';
				const newFuelPurchase = {
					vehicle_id: 2,
					fuel_type_id: 1,
					fuel_grade: emptyString,
					odometer: 1200,
					amount: 14,
					price: 3,
					fuel_brand: 'Chevron Plus',
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'fuel_grade' must be at least 1 character long.`);
			});

			it('Should reject a new fuel purchases if fuel_brand doens\'t have at least 1 character.'.cyan, async () => {
				const emptyString = '';
				const newFuelPurchase = {
					vehicle_id: 2,
					fuel_type_id: 1,
					fuel_grade: '85',
					odometer: 1200,
					amount: 14,
					price: 3,
					fuel_brand: emptyString,
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'fuel_brand' must be at least 1 character long.`);
			});

			it('Should reject a new fuel purchases if fuel_station doens\'t have at least 1 character.'.cyan, async () => {
				const emptyString = '';
				const newFuelPurchase = {
					vehicle_id: 2,
					fuel_type_id: 1,
					fuel_grade: '85',
					odometer: 1200,
					amount: 14,
					price: 3,
					fuel_brand: 'Chevron',
					fuel_station: emptyString,
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'fuel_station' must be at least 1 character long.`);
			});

			it('Should reject a new fuel purchases if note doens\'t have at least 1 character.'.cyan, async () => {
				const emptyString = '';
				const newFuelPurchase = {
					vehicle_id: 2,
					fuel_type_id: 1,
					fuel_grade: '85',
					odometer: 1200,
					amount: 14,
					price: 3,
					fuel_brand: 'Chevron',
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: emptyString,
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'note' must be at least 1 character long.`);
			});

			it('Should reject a new fuel purchases if fuel_grade exceeds 25 characters.'.cyan, async () => {
				const fieldTooLarge = 'a'.repeat(26);
				const newFuelPurchase = {
					vehicle_id: 2,
					fuel_type_id: 1,
					fuel_grade: fieldTooLarge,
					odometer: 1200,
					amount: 14,
					price: 3,
					fuel_brand: 'Chevron Plus',
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'fuel_grade' must be at most 25 characters long.`);
			});

			it('Should reject a new fuel purchases if fuel_brand exceeds 50 characters.'.cyan, async () => {
				const fieldTooLarge = 'a'.repeat(51);
				const newFuelPurchase = {
					vehicle_id: 2,
					fuel_type_id: 1,
					fuel_grade: '85',
					odometer: 1200,
					amount: 14,
					price: 3,
					fuel_brand: fieldTooLarge,
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'fuel_brand' must be at most 50 characters long.`);
			});

			it('Should reject a new fuel purchases if fuel_station exceeds 50 characters.'.cyan, async () => {
				const fieldTooLarge = 'a'.repeat(51);
				const newFuelPurchase = {
					vehicle_id: 2,
					fuel_type_id: 1,
					fuel_grade: '85',
					odometer: 1200,
					amount: 14,
					price: 3,
					fuel_brand: 'Chevron',
					fuel_station: fieldTooLarge,
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'fuel_station' must be at most 50 characters long.`);
			});

			it('Should reject a new fuel purchases if note exceeds 255 characters.'.cyan, async () => {
				const fieldTooLarge = 'a'.repeat(256);
				const newFuelPurchase = {
					vehicle_id: 2,
					fuel_type_id: 1,
					fuel_grade: '85',
					odometer: 1200,
					amount: 14,
					price: 3,
					fuel_brand: 'Chevron',
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: fieldTooLarge,
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'note' must be at most 255 characters long.`);
			});

			it('Should reject a new fuel purchases if the vehicle_id is not a number.'.cyan, async () => {
				const nonIntField = 'nonIntField';
				const newFuelPurchase = {
					vehicle_id: nonIntField,
					fuel_type_id: 1,
					fuel_grade: '85',
					odometer: 1200,
					amount: 14,
					price: 3,
					fuel_brand: 'Chevron Plus',
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'vehicle_id' must be a number.`);
			});

			it('Should reject a new fuel purchases if the fuel_type_id is not a number.'.cyan, async () => {
				const nonIntField = 'nonIntField';
				const newFuelPurchase = {
					vehicle_id: 1,
					fuel_type_id: nonIntField,
					fuel_grade: '85',
					odometer: 1200,
					amount: 14,
					price: 3,
					fuel_brand: 'Chevron Plus',
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'fuel_type_id' must be a number.`);
			});

			it('Should reject a new fuel purchases if the odometer is not a number.'.cyan, async () => {
				const nonIntField = 'nonIntField';
				const newFuelPurchase = {
					vehicle_id: 1,
					fuel_type_id: 1,
					fuel_grade: '85',
					odometer: nonIntField,
					amount: 14,
					price: 3,
					fuel_brand: 'Chevron Plus',
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'odometer' must be a number.`);
			});

			it('Should reject a new fuel purchases if the amount is not a number.'.cyan, async () => {
				const nonIntField = 'nonIntField';
				const newFuelPurchase = {
					vehicle_id: 1,
					fuel_type_id: 1,
					fuel_grade: '85',
					odometer: 400,
					amount: nonIntField,
					price: 3,
					fuel_brand: 'Chevron Plus',
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'amount' must be a number.`);
			});

			it('Should reject a new fuel purchases if the price is not a number.'.cyan, async () => {
				const nonIntField = 'nonIntField';
				const newFuelPurchase = {
					vehicle_id: 1,
					fuel_type_id: 1,
					fuel_grade: '85',
					odometer: 400,
					amount: 14,
					price: nonIntField,
					fuel_brand: 'Chevron Plus',
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'price' must be a number.`);
			});

			it('Should reject a new fuel purchases if the vehicle_id is not a positive number.'.cyan, async () => {
				const negativeInt = -5;
				const newFuelPurchase = {
					vehicle_id: negativeInt,
					fuel_type_id: 1,
					fuel_grade: '85',
					odometer: 1200,
					amount: 14,
					price: 3,
					fuel_brand: 'Chevron Plus',
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'vehicle_id' must be a positive number.`);
			});

			it('Should reject a new fuel purchases if the fuel_type_id is not a positive number.'.cyan, async () => {
				const negativeInt = -5;
				const newFuelPurchase = {
					vehicle_id: 1,
					fuel_type_id: negativeInt,
					fuel_grade: '85',
					odometer: 1200,
					amount: 14,
					price: 3,
					fuel_brand: 'Chevron Plus',
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'fuel_type_id' must be a positive number.`);
			});

			it('Should reject a new fuel purchases if the odometer is not a positive number.'.cyan, async () => {
				const negativeInt = -5;
				const newFuelPurchase = {
					vehicle_id: 1,
					fuel_type_id: 1,
					fuel_grade: '85',
					odometer: negativeInt,
					amount: 14,
					price: 3,
					fuel_brand: 'Chevron Plus',
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'odometer' must be a positive number.`);
			});

			it('Should reject a new fuel purchases if the amount is not a positive number.'.cyan, async () => {
				const negativeInt = -5;
				const newFuelPurchase = {
					vehicle_id: 1,
					fuel_type_id: 1,
					fuel_grade: '85',
					odometer: 1200,
					amount: negativeInt,
					price: 3,
					fuel_brand: 'Chevron Plus',
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'amount' must be a positive number.`);
			});

			it('Should reject a new fuel purchases if the price is not a positive number.'.cyan, async () => {
				const negativeInt = -5;
				const newFuelPurchase = {
					vehicle_id: 1,
					fuel_type_id: 1,
					fuel_grade: '85',
					odometer: 1200,
					amount: 14,
					price: negativeInt,
					fuel_brand: 'Chevron Plus',
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'price' must be a positive number.`);
			});

			it('Should create a new fuel purchase.'.cyan, async () => {
				const newFuelPurchase = {
					vehicle_id: 1,
					fuel_type_id: 1,
					fuel_grade: '85',
					odometer: 1200.55,
					amount: 14.55,
					price: 3.45,
					fuel_brand: 'Chevron Plus',
					fuel_station: 'Smiths',
					partial_tank: false,
					missed_prev_fill_up: false,
					note: 'Test Note',
					date_of_fill_up: "2020-09-05 23:01:46.778843"
				};
				const response = await chai
					.request(server)
					.post('/api/fuel_purchase')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newFuelPurchase);
				expect(response).to.be.json;
				expect(response).to.have.status(201);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				expect(response.body.fuel_purchase_id).to.exist;
				expect(response.body.user_id).to.exist;
				expect(response.body.vehicle_id).to.exist;
				expect(response.body.fuel_type_id).to.equal(newFuelPurchase.fuel_type_id);
				expect(response.body.fuel_grade).to.equal(newFuelPurchase.fuel_grade);
				expect(Number(response.body.odometer)).to.equal(newFuelPurchase.odometer);
				expect(Number(response.body.amount)).to.equal(newFuelPurchase.amount);
				expect(Number(response.body.price)).to.equal(newFuelPurchase.price);
				expect(response.body.fuel_brand).to.equal(newFuelPurchase.fuel_brand);
				expect(response.body.fuel_station).to.equal(newFuelPurchase.fuel_station);
				expect(response.body.partial_tank).to.equal(newFuelPurchase.partial_tank);
				expect(response.body.missed_prev_fill_up).to.equal(newFuelPurchase.missed_prev_fill_up)
				expect(response.body.note).to.equal(newFuelPurchase.note);
				// expect(response.body.date_of_fill_up).to.equal(newFuelPurchase.date_of_fill_up);
				expect(response.body.created_on).to.exist;
				expect(response.body.modified_on).to.exist;

				const fuelPurchaseId = response.body.fuel_purchase_id;
				const response_2 = await chai
					.request(server)
					.get(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('Authorization', `Bearer ${authToken}`)
				const fuel_purchase = response_2.body[0];
				expect(fuel_purchase).to.exist;
				expect(fuel_purchase.fuel_purchase_id).to.equal(response.body.fuel_purchase_id);
				expect(fuel_purchase.user_id).to.equal(response.body.user_id);
				expect(fuel_purchase.vehicle_id).to.equal(response.body.vehicle_id);
				expect(fuel_purchase.fuel_type_id).to.equal(response.body.fuel_type_id);
				expect(fuel_purchase.fuel_grade).to.equal(response.body.fuel_grade);
				expect(fuel_purchase.odometer).to.equal(response.body.odometer);
				expect(fuel_purchase.amount).to.equal(response.body.amount);
				expect(fuel_purchase.price).to.equal(response.body.price);
				expect(fuel_purchase.fuel_brand).to.equal(response.body.fuel_brand);
				expect(fuel_purchase.fuel_station).to.equal(response.body.fuel_station);
				expect(fuel_purchase.partial_tank).to.equal(response.body.partial_tank);
				expect(fuel_purchase.missed_prev_fill_up).to.equal(response.body.missed_prev_fill_up);
				expect(fuel_purchase.note).to.equal(response.body.note);
				// expect(fuel_purchase.date_of_fill_up).to.equal(response.body.date_of_fill_up);
				expect(fuel_purchase.created_on).to.equal(response.body.created_on);
				expect(fuel_purchase.modified_on).to.equal(response.body.modified_on);
			});
		});

		describe('PUT'.blue, () => {
			it('Should reject a fuel purchase update if the JWT token is missing.'.cyan, async () => {
				const updateData = {
					vehicle_id: 1
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].vehicle_id).to.not.equal(updateData.vehicle_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ')
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(401);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('name', 'message', 'status');
				expect(updateResponse.body.status).to.equal(401);
				expect(updateResponse.body.message).to.equal('Unauthorized');
				expect(updateResponse.body.name).to.equal('AuthenticationError');
			});

			it('Should reject a fuel purchase update if the JWT token is invalid.'.cyan, async () => {
				const updateData = {
					vehicle_id: 1
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].vehicle_id).to.not.equal(updateData.vehicle_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + 'Invalid Token')
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(401);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('name', 'message', 'status');
				expect(updateResponse.body.status).to.equal(401);
				expect(updateResponse.body.message).to.equal('Unauthorized');
				expect(updateResponse.body.name).to.equal('AuthenticationError');
			});

			it('Should reject a fuel purchase update if an update on the fuel_purchase_id is attempted.'.cyan, async () => {
				const updateData = {
					fuel_purchase_id: 2
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_purchase_id).to.not.equal(updateData.fuel_purchase_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`'fuel_purchase_id' is not an updateable field.`);
			});

			it('Should reject a fuel purchase update if an update on the user_id is attempted.'.cyan, async () => {
				const updateData = {
					user_id: 2
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_purchase_id).to.not.equal(updateData.fuel_purchase_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`'user_id' is not an updateable field.`);
			});

			it('Should reject a fuel purchase update if the fuel_grade is not a string.'.cyan, async () => {
				const updateData = {
					fuel_grade: 2
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_purchase_id).to.not.equal(updateData.fuel_purchase_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'fuel_grade' must be a string.`);
			});

			it('Should reject a fuel purchase update if the fuel_brand is not a string.'.cyan, async () => {
				const updateData = {
					fuel_brand: 2
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_purchase_id).to.not.equal(updateData.fuel_purchase_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'fuel_brand' must be a string.`);
			});

			it('Should reject a fuel purchase update if the fuel_station is not a string.'.cyan, async () => {
				const updateData = {
					fuel_station: 2
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_purchase_id).to.not.equal(updateData.fuel_purchase_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'fuel_station' must be a string.`);
			});

			it('Should reject a fuel purchase update if the note is not a string.'.cyan, async () => {
				const updateData = {
					note: 2
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_purchase_id).to.not.equal(updateData.fuel_purchase_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'note' must be a string.`);
			});

			it('Should reject a fuel purchase update if a string starts or ends with white spaces.'.cyan, async () => {
				const updateData = {
					fuel_grade: '     85'
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_purchase_id).to.not.equal(updateData.fuel_purchase_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'fuel_grade' cannot start or end with a whitespace.`);
			});

			it('Should reject a fuel purchase update if the fuel_grade doesn\'t have at least 1 character.'.cyan, async () => {
				const updateData = {
					fuel_grade: ''
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_purchase_id).to.not.equal(updateData.fuel_purchase_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'fuel_grade' must be at least 1 character long.`);
			});

			it('Should reject a fuel purchase update if the fuel_brand doesn\'t have at least 1 character.'.cyan, async () => {
				const updateData = {
					fuel_brand: ''
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_purchase_id).to.not.equal(updateData.fuel_purchase_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'fuel_brand' must be at least 1 character long.`);
			});

			it('Should reject a fuel purchase update if the fuel_station doesn\'t have at least 1 character.'.cyan, async () => {
				const updateData = {
					fuel_station: ''
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_purchase_id).to.not.equal(updateData.fuel_purchase_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'fuel_station' must be at least 1 character long.`);
			});

			it('Should reject a fuel purchase update if the note doesn\'t have at least 1 character.'.cyan, async () => {
				const updateData = {
					note: ''
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_purchase_id).to.not.equal(updateData.fuel_purchase_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'note' must be at least 1 character long.`);
			});

			it('Should reject a fuel purchase update if the fuel_grade exceeds 25 characters.'.cyan, async () => {
				const updateData = {
					fuel_grade: 'a'.repeat(26)
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_purchase_id).to.not.equal(updateData.fuel_purchase_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'fuel_grade' must be at most 25 characters long.`);
			});

			it('Should reject a fuel purchase update if the fuel_brand exceeds 50 characters.'.cyan, async () => {
				const updateData = {
					fuel_brand: 'a'.repeat(51)
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_purchase_id).to.not.equal(updateData.fuel_purchase_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'fuel_brand' must be at most 50 characters long.`);
			});

			it('Should reject a fuel purchase update if the fuel_station exceeds 50 characters.'.cyan, async () => {
				const updateData = {
					fuel_station: 'a'.repeat(51)
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_purchase_id).to.not.equal(updateData.fuel_purchase_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'fuel_station' must be at most 50 characters long.`);
			});

			it('Should reject a fuel purchase update if the note exceeds 255 characters.'.cyan, async () => {
				const updateData = {
					note: 'a'.repeat(256)
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_purchase_id).to.not.equal(updateData.fuel_purchase_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'note' must be at most 255 characters long.`);
			});

			it('Should reject a fuel purchase update if the vehicle_id is not a number.'.cyan, async () => {
				const updateData = {
					vehicle_id: 'Not a number.'
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_purchase_id).to.not.equal(updateData.fuel_purchase_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'vehicle_id' must be a number.`);
			});

			it('Should reject a fuel purchase update if the fuel_type_id is not a number.'.cyan, async () => {
				const updateData = {
					fuel_type_id: 'Not a number.'
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_purchase_id).to.not.equal(updateData.fuel_purchase_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'fuel_type_id' must be a number.`);
			});

			it('Should reject a fuel purchase update if the odometer is not a number.'.cyan, async () => {
				const updateData = {
					odometer: 'Not a number.'
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_purchase_id).to.not.equal(updateData.fuel_purchase_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'odometer' must be a number.`);
			});

			it('Should reject a fuel purchase update if the amount is not a number.'.cyan, async () => {
				const updateData = {
					amount: 'Not a number.'
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_purchase_id).to.not.equal(updateData.fuel_purchase_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'amount' must be a number.`);
			});

			it('Should reject a fuel purchase update if the price is not a number.'.cyan, async () => {
				const updateData = {
					price: 'Not a number.'
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_purchase_id).to.not.equal(updateData.fuel_purchase_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'price' must be a number.`);
			});

			it('Should reject a fuel purchase update if the vehicle_id is not a positive number.'.cyan, async () => {
				const updateData = {
					vehicle_id: -5
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_purchase_id).to.not.equal(updateData.fuel_purchase_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'vehicle_id' must be a positive number.`);
			});

			it('Should reject a fuel purchase update if the fuel_type_id is not a positive number.'.cyan, async () => {
				const updateData = {
					fuel_type_id: -5
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_purchase_id).to.not.equal(updateData.fuel_purchase_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'fuel_type_id' must be a positive number.`);
			});

			it('Should reject a fuel purchase update if the odometer is not a positive number.'.cyan, async () => {
				const updateData = {
					odometer: -5
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_purchase_id).to.not.equal(updateData.fuel_purchase_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'odometer' must be a positive number.`);
			});

			it('Should reject a fuel purchase update if the amount is not a positive number.'.cyan, async () => {
				const updateData = {
					amount: -5
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_purchase_id).to.not.equal(updateData.fuel_purchase_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'amount' must be a positive number.`);
			});

			it('Should reject a fuel purchase update if the price is not a positive number.'.cyan, async () => {
				const updateData = {
					price: -5
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_purchase_id).to.not.equal(updateData.fuel_purchase_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'price' must be a positive number.`);
			});

			it('Should update a fuel purchases vehicle_id value.'.cyan, async () => {
				const updateData = {
					vehicle_id: 1
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].vehicle_id).to.not.equal(updateData.vehicle_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(200);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				expect(updateResponse.body.vehicle_id).to.equal(updateData.vehicle_id);
			});

			it('Should update a fuel purchases fuel_type_id value.'.cyan, async () => {
				const updateData = {
					fuel_type_id: 1
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_type_id).to.not.equal(updateData.fuel_type_id);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(200);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				expect(updateResponse.body.fuel_type_id).to.equal(updateData.fuel_type_id);
			});

			it('Should update a fuel purchases fuel_grade value.'.cyan, async () => {
				const updateData = {
					fuel_grade: '86'
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_grade).to.not.equal(updateData.fuel_grade);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(200);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				expect(updateResponse.body.fuel_grade).to.equal(updateData.fuel_grade);
			});

			it('Should update a fuel purchases odometer value.'.cyan, async () => {
				const updateData = {
					odometer: 1000
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].odometer).to.not.equal(updateData.odometer);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(200);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				expect(parseFloat(updateResponse.body.odometer)).to.equal(updateData.odometer);
			});

			it('Should update a fuel purchases amount value.'.cyan, async () => {
				const updateData = {
					amount: 15
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].amount).to.not.equal(updateData.amount);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(200);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				expect(parseFloat(updateResponse.body.amount)).to.equal(updateData.amount);
			});

			it('Should update a fuel purchases price value.'.cyan, async () => {
				const updateData = {
					price: 2.55
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].price).to.not.equal(updateData.price);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(200);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				expect(parseFloat(updateResponse.body.price)).to.equal(updateData.price);
			});

			it('Should update a fuel purchases fuel_brand value.'.cyan, async () => {
				const updateData = {
					fuel_brand: 'Evern Better Brand'
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_brand).to.not.equal(updateData.fuel_brand);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(200);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				expect(updateResponse.body.fuel_brand).to.equal(updateData.fuel_brand);
			});

			it('Should update a fuel purchases fuel_station value.'.cyan, async () => {
				const updateData = {
					fuel_station: 'Not Smiths'
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].fuel_station).to.not.equal(updateData.fuel_station);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(200);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				expect(updateResponse.body.fuel_station).to.equal(updateData.fuel_station);
			});

			it('Should update a fuel purchases partial_tank value.'.cyan, async () => {
				const updateData = {
					partial_tank: true
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].partial_tank).to.not.equal(updateData.partial_tank);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(200);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				expect(updateResponse.body.partial_tank).to.equal(updateData.partial_tank);
			});

			it('Should update a fuel purchases missed_prev_fill_up value.'.cyan, async () => {
				const updateData = {
					missed_prev_fill_up: true
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].missed_prev_fill_up).to.not.equal(updateData.missed_prev_fill_up);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(200);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				expect(updateResponse.body.missed_prev_fill_up).to.equal(updateData.missed_prev_fill_up);
			});

			it('Should update a fuel purchases note value.'.cyan, async () => {
				const updateData = {
					note: 'Modified NOTE'
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].note).to.not.equal(updateData.note);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(200);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				expect(updateResponse.body.note).to.equal(updateData.note);
			});

			it.skip('Should update a fuel purchases date_of_fill_up value.'.cyan, async () => {
				const updateData = {
					date_of_fill_up: '2020-10-05 05:22:46.778843'
				};
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].date_of_fill_up).to.not.equal(updateData.date_of_fill_up);
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(200);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				expect(updateResponse.body.date_of_fill_up).to.equal(updateData.date_of_fill_up);
			});

		});

		describe('DELETE'.red, () => {
			it('Should reject a fuel purchase delete if the JWT token is invalid.'.cyan, async () => {
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const deleteResponse = await chai
					.request(server)
					.delete(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + 'invalid-Token')
				expect(deleteResponse).to.be.json;
				expect(deleteResponse).to.have.status(401);
				expect(deleteResponse.body).to.be.an('object');
				expect(deleteResponse.body).to.include.keys('name', 'message', 'status');
				expect(deleteResponse.body.status).to.equal(401);
				expect(deleteResponse.body.message).to.equal(`Unauthorized`);
				expect(deleteResponse.body.name).to.equal(`AuthenticationError`);
			});

			it('Should reject a fuel purchase delete if the jwt token is missing.'.cyan, async () => {
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const deleteResponse = await chai
					.request(server)
					.delete(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ')
				expect(deleteResponse).to.be.json;
				expect(deleteResponse).to.have.status(401);
				expect(deleteResponse.body).to.be.an('object');
				expect(deleteResponse.body).to.include.keys('name', 'message', 'status');
				expect(deleteResponse.body.status).to.equal(401);
				expect(deleteResponse.body.message).to.equal(`Unauthorized`);
				expect(deleteResponse.body.name).to.equal(`AuthenticationError`);
			});

			it('Should reject a fuel purchase delete when the fuel purchase id is not valid.'.cyan, async () => {
				const response = await chai
					.request(server)
					.delete('/api/fuel_purchase/invalidID')
					.set('Authorization', `Bearer ${authToken}`);
				expect(response).to.be.json;
				expect(response).to.have.status(400);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(400);
				expect(response.body.message).to.equal('Invalid fuel purchase id.');
			});

			it('Should reject a fuel purchase delete when the fuel purchase does not exist.'.cyan, async () => {
				const response = await chai
					.request(server)
					.delete('/api/fuel_purchase/1000')
					.set('Authorization', `Bearer ${authToken}`);
				expect(response).to.be.json;
				expect(response).to.have.status(406);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(406);
				expect(response.body.message).to.equal('Could not find a fuel purchase with fuel_purchase_id: 1000.');
			});

			it('Should delete a fuel purchase by id.'.cyan, async () => {
				const response = await chai
					.request(server)
					.get(`/api/fuel_purchase`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0]).to.include.keys(
					'fuel_purchase_id',
					'user_id',
					'vehicle_id',
					'fuel_type_id',
					'fuel_grade',
					'odometer',
					'amount',
					'price',
					'fuel_brand',
					'fuel_station',
					'partial_tank',
					'missed_prev_fill_up',
					'note',
					'date_of_fill_up',
					'created_on',
					'modified_on'
				);
				const fuelPurchaseId = response.body[0].fuel_purchase_id;
				const deleteResponse = await chai
					.request(server)
					.delete(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
				expect(deleteResponse).to.have.status(204);
				const response_2 = await chai
					.request(server)
					.get(`/api/fuel_purchase/${fuelPurchaseId}`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response_2).to.be.json;
				expect(response_2).to.have.status(200);
				expect(response_2.body).to.be.an('array');
				expect(response_2.body.length).to.equal(0);
			});
		});
	});
});