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

describe('Vehicles API Resources'.cyan.bold.underline, async () => {
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

	describe('api/vehicle'.cyan.bold, () => {
		describe('GET'.green, () => {
			it('Should return all existing vehicles for a user.'.cyan, async () => {
				const response = await chai
					.request(server)
					.get('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`);
				const vehicle = response.body[0];
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object')
				expect(vehicle).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on'
				);
			});

			it('Should return a specific vehicles for a user.'.cyan, async () => {
				const getAllResponse = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(getAllResponse).to.be.json;
				expect(getAllResponse).to.have.status(200);
				expect(getAllResponse.body).to.be.an('array');
				expect(getAllResponse.body[0]).to.be.an('object');
				expect(getAllResponse.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = getAllResponse.body[0].vehicle_id;

				const response = await chai
					.request(server)
					.get(`/api/vehicle/${vehicleId}`)
					.set('Authorization', `Bearer ${authToken}`);
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on'
				);
			});
		});

		describe('POST'.yellow, () => {
			it('Should reject a new vehicle if the JWT token is missing.'.cyan, async () => {
				const newVehicle = {
					vehicle_name: 'testVehicle',
					vehicle_year: 2020,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(401);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('name', 'message', 'status');
				expect(response.body.status).to.equal(401);
				expect(response.body.message).to.equal('Unauthorized');
				expect(response.body.name).to.equal('AuthenticationError');
			});

			it('Should reject a new vehicle if the JWT token is invalid.'.cyan, async () => {
				const newVehicle = {
					vehicle_name: 'testVehicle',
					vehicle_year: 2020,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('authorization', 'Bearer ' + 'InvalidAuthToken')
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(401);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('name', 'message', 'status');
				expect(response.body.status).to.equal(401);
				expect(response.body.message).to.equal('Unauthorized');
				expect(response.body.name).to.equal('AuthenticationError');
			});

			it('Should reject a new vehicle if there is an invalid field.'.cyan, async () => {
				const invalidField = 'invalidField';
				const newVehicle = {
					vehicle_name: 'testVehicle',
					vehicle_year: 2020,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note',
					invalidField: invalidField
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`'invalidField' is not a valid field.`);
			});

			it('Should reject a new vehicle if the vehicle_name is missing.'.cyan, async () => {
				const newVehicle = {
					vehicle_year: 2020,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`'vehicle_name' is required.`);
			});

			it('Should reject a new vehicle if the vehicle_name is not a string.'.cyan, async () => {
				const nonStringField = 5;
				const newVehicle = {
					vehicle_name: nonStringField,
					vehicle_year: 2020,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'vehicle_name' must be a string.`);
			});

			it('Should reject a new vehicle if the vin is not a string.'.cyan, async () => {
				const nonStringField = 5;
				const newVehicle = {
					vehicle_name: 'Honda',
					vehicle_year: 2020,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: nonStringField,
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'vin' must be a string.`);
			});

			it('Should reject a new vehicle if the license_plate is not a string.'.cyan, async () => {
				const nonStringField = 5;
				const newVehicle = {
					vehicle_name: 'Honda',
					vehicle_year: 2020,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: '654651651',
					license_plate: nonStringField,
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'license_plate' must be a string.`);
			});

			it('Should reject a new vehicle if the insurance_number is not a string.'.cyan, async () => {
				const nonStringField = 5;
				const newVehicle = {
					vehicle_name: 'Honda',
					vehicle_year: 2020,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: '654651651',
					license_plate: '656SEWE',
					insurance_number: nonStringField,
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'insurance_number' must be a string.`);
			});

			it('Should reject a new vehicle if the note is not a string.'.cyan, async () => {
				const nonStringField = 5;
				const newVehicle = {
					vehicle_name: 'Honda',
					vehicle_year: 2020,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: '654651651',
					license_plate: '656SEWE',
					insurance_number: '654165165',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: nonStringField
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'note' must be a string.`);
			});

			it('Should reject a new vehicle if a string field starts or ends with whitespaces.'.cyan, async () => {
				const nonTrimmedField = '   Kia';
				const newVehicle = {
					vehicle_name: nonTrimmedField,
					vehicle_year: 2020,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'vehicle_name' cannot start or end with a whitespace.`);
			});

			it('Should reject a new vehicle if the vehicle_name doens\'t have at least 1 character.'.cyan, async () => {
				const emptyString = '';
				const newVehicle = {
					vehicle_name: emptyString,
					vehicle_year: 2020,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'vehicle_name' must be at least 1 character long.`);
			});

			it('Should reject a new vehicle if the vin doens\'t have at least 1 character.'.cyan, async () => {
				const emptyString = '';
				const newVehicle = {
					vehicle_name: 'Honda',
					vehicle_year: 2020,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: emptyString,
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'vin' must be at least 1 character long.`);
			});

			it('Should reject a new vehicle if the license_plate doens\'t have at least 1 character.'.cyan, async () => {
				const emptyString = '';
				const newVehicle = {
					vehicle_name: 'Honda',
					vehicle_year: 2020,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: '6546541234234asdf',
					license_plate: emptyString,
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'license_plate' must be at least 1 character long.`);
			});

			it('Should reject a new vehicle if the insurance_number doens\'t have at least 1 character.'.cyan, async () => {
				const emptyString = '';
				const newVehicle = {
					vehicle_name: 'Honda',
					vehicle_year: 2020,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: '6546541234234asdf',
					license_plate: '676DDF',
					insurance_number: emptyString,
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'insurance_number' must be at least 1 character long.`);
			});

			it('Should reject a new vehicle if the note doens\'t have at least 1 character.'.cyan, async () => {
				const emptyString = '';
				const newVehicle = {
					vehicle_name: 'Honda',
					vehicle_year: 2020,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: '6546541234234asdf',
					license_plate: '676DDF',
					insurance_number: '65465416165',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: emptyString
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'note' must be at least 1 character long.`);
			});

			it('Should reject a new vehicle if the vehicle_name exceeds 35 characters.'.cyan, async () => {
				const fieldTooLarge = 'a'.repeat(36);
				const newVehicle = {
					vehicle_name: fieldTooLarge,
					vehicle_year: 2020,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'vehicle_name' must be at most 35 characters long.`);
			});

			it('Should reject a new vehicle if the vin exceeds 20 characters.'.cyan, async () => {
				const fieldTooLarge = 'a'.repeat(21);
				const newVehicle = {
					vehicle_name: 'Honda',
					vehicle_year: 2020,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: fieldTooLarge,
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'vin' must be at most 20 characters long.`);
			});

			it('Should reject a new vehicle if the license_plate exceeds 20 characters.'.cyan, async () => {
				const fieldTooLarge = 'a'.repeat(21);
				const newVehicle = {
					vehicle_name: 'Honda',
					vehicle_year: 2020,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: '465465asdfasdf',
					license_plate: fieldTooLarge,
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'license_plate' must be at most 20 characters long.`);
			});

			it('Should reject a new vehicle if the insurance_number exceeds 50 characters.'.cyan, async () => {
				const fieldTooLarge = 'a'.repeat(51);
				const newVehicle = {
					vehicle_name: 'Honda',
					vehicle_year: 2020,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: '465465asdfasdf',
					license_plate: '6546SDFSD',
					insurance_number: fieldTooLarge,
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'insurance_number' must be at most 50 characters long.`);
			});

			it('Should reject a new vehicle if the note exceeds 255 characters.'.cyan, async () => {
				const fieldTooLarge = 'a'.repeat(256);
				const newVehicle = {
					vehicle_name: 'Honda',
					vehicle_year: 2020,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: '465465asdfasdf',
					license_plate: '6546SDFSD',
					insurance_number: '54165465',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: fieldTooLarge
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'note' must be at most 255 characters long.`);
			});

			it('Should reject a new vehicle if the vehicle_year is not a number.'.cyan, async () => {
				const nonIntField = 'nonIntField';
				const newVehicle = {
					vehicle_name: 'testVehicle',
					vehicle_year: nonIntField,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'vehicle_year' must be a number.`);
			});

			it('Should reject a new vehicle if the type_id is not a number.'.cyan, async () => {
				const nonIntField = 'nonIntField';
				const newVehicle = {
					vehicle_name: 'testVehicle',
					vehicle_year: 2006,
					type_id: nonIntField,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'type_id' must be a number.`);
			});

			it('Should reject a new vehicle if the make_id is not a number.'.cyan, async () => {
				const nonIntField = 'nonIntField';
				const newVehicle = {
					vehicle_name: 'testVehicle',
					vehicle_year: 2006,
					type_id: 1,
					make_id: nonIntField,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'make_id' must be a number.`);
			});

			it('Should reject a new vehicle if the model_id is not a number.'.cyan, async () => {
				const nonIntField = 'nonIntField';
				const newVehicle = {
					vehicle_name: 'testVehicle',
					vehicle_year: 2006,
					type_id: 1,
					make_id: 1,
					model_id: nonIntField,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'model_id' must be a number.`);
			});

			it('Should reject a new vehicle if the sub_model_id is not a number.'.cyan, async () => {
				const nonIntField = 'nonIntField';
				const newVehicle = {
					vehicle_name: 'testVehicle',
					vehicle_year: 2006,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: nonIntField,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'sub_model_id' must be a number.`);
			});

			it('Should reject a new vehicle if the transmission_id is not a number.'.cyan, async () => {
				const nonIntField = 'nonIntField';
				const newVehicle = {
					vehicle_name: 'testVehicle',
					vehicle_year: 2006,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: nonIntField,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'transmission_id' must be a number.`);
			});

			it('Should reject a new vehicle if the drive_type_id is not a number.'.cyan, async () => {
				const nonIntField = 'nonIntField';
				const newVehicle = {
					vehicle_name: 'testVehicle',
					vehicle_year: 2006,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: nonIntField,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'drive_type_id' must be a number.`);
			});

			it('Should reject a new vehicle if the body_type_id is not a number.'.cyan, async () => {
				const nonIntField = 'nonIntField';
				const newVehicle = {
					vehicle_name: 'testVehicle',
					vehicle_year: 2006,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: nonIntField,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'body_type_id' must be a number.`);
			});

			it('Should reject a new vehicle if the bed_type_id is not a number.'.cyan, async () => {
				const nonIntField = 'nonIntField';
				const newVehicle = {
					vehicle_name: 'testVehicle',
					vehicle_year: 2006,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: nonIntField,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'bed_type_id' must be a number.`);
			});

			it('Should reject a new vehicle if the oil_change_frequency is not a number.'.cyan, async () => {
				const nonIntField = 'nonIntField';
				const newVehicle = {
					vehicle_name: 'testVehicle',
					vehicle_year: 2006,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: nonIntField,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'oil_change_frequency' must be a number.`);
			});

			it('Should reject a new vehicle if the default_energy_type_id is not a number.'.cyan, async () => {
				const nonIntField = 'nonIntField';
				const newVehicle = {
					vehicle_name: 'testVehicle',
					vehicle_year: 2006,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: nonIntField,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'default_energy_type_id' must be a number.`);
			});

			it('Should reject a new vehicle if the default_fuel_grade_id is not a number.'.cyan, async () => {
				const nonIntField = 'nonIntField';
				const newVehicle = {
					vehicle_name: 'testVehicle',
					vehicle_year: 2006,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 1,
					default_fuel_grade_id: nonIntField,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'default_fuel_grade_id' must be a number.`);
			});

			it('Should reject a new vehicle if the vehicle_year is not a positive number.'.cyan, async () => {
				const negativeInt = -5;
				const newVehicle = {
					vehicle_name: 'testVehicle',
					vehicle_year: negativeInt,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'vehicle_year' must be a positive number.`);
			});

			it('Should reject a new vehicle if the type_id is not a positive number.'.cyan, async () => {
				const negativeInt = -5;
				const newVehicle = {
					vehicle_name: 'testVehicle',
					vehicle_year: 2006,
					type_id: negativeInt,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'type_id' must be a positive number.`);
			});

			it('Should reject a new vehicle if the make_id is not a positive number.'.cyan, async () => {
				const negativeInt = -5;
				const newVehicle = {
					vehicle_name: 'testVehicle',
					vehicle_year: 2006,
					type_id: 1,
					make_id: negativeInt,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'make_id' must be a positive number.`);
			});

			it('Should reject a new vehicle if the model_id is not a positive number.'.cyan, async () => {
				const negativeInt = -5;
				const newVehicle = {
					vehicle_name: 'testVehicle',
					vehicle_year: 2006,
					type_id: 1,
					make_id: 1,
					model_id: negativeInt,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'model_id' must be a positive number.`);
			});

			it('Should reject a new vehicle if the sub_model_id is not a positive number.'.cyan, async () => {
				const negativeInt = -5;
				const newVehicle = {
					vehicle_name: 'testVehicle',
					vehicle_year: 2006,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: negativeInt,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'sub_model_id' must be a positive number.`);
			});

			it('Should reject a new vehicle if the transmission_id is not a positive number.'.cyan, async () => {
				const negativeInt = -5;
				const newVehicle = {
					vehicle_name: 'testVehicle',
					vehicle_year: 2006,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: negativeInt,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'transmission_id' must be a positive number.`);
			});

			it('Should reject a new vehicle if the drive_type_id is not a positive number.'.cyan, async () => {
				const negativeInt = -5;
				const newVehicle = {
					vehicle_name: 'testVehicle',
					vehicle_year: 2006,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: negativeInt,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'drive_type_id' must be a positive number.`);
			});

			it('Should reject a new vehicle if the body_type_id is not a positive number.'.cyan, async () => {
				const negativeInt = -5;
				const newVehicle = {
					vehicle_name: 'testVehicle',
					vehicle_year: 2006,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: negativeInt,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'body_type_id' must be a positive number.`);
			});

			it('Should reject a new vehicle if the bed_type_id is not a positive number.'.cyan, async () => {
				const negativeInt = -5;
				const newVehicle = {
					vehicle_name: 'testVehicle',
					vehicle_year: 2006,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: negativeInt,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'bed_type_id' must be a positive number.`);
			});

			it('Should reject a new vehicle if the oil_change_frequency is not a positive number.'.cyan, async () => {
				const negativeInt = -5;
				const newVehicle = {
					vehicle_name: 'testVehicle',
					vehicle_year: 2006,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: negativeInt,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'oil_change_frequency' must be a positive number.`);
			});

			it('Should reject a new vehicle if the default_energy_type_id is not a positive number.'.cyan, async () => {
				const negativeInt = -5;
				const newVehicle = {
					vehicle_name: 'testVehicle',
					vehicle_year: 2006,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: negativeInt,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'default_energy_type_id' must be a positive number.`);
			});

			it('Should reject a new vehicle if the default_fuel_grade_id is not a positive number.'.cyan, async () => {
				const negativeInt = -5;
				const newVehicle = {
					vehicle_name: 'testVehicle',
					vehicle_year: 2006,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 1,
					default_fuel_grade_id: negativeInt,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'default_fuel_grade_id' must be a positive number.`);
			});

			it('Should create a new vehicle.'.cyan, async () => {
				const newVehicle = {
					vehicle_name: 'testVehicle',
					vehicle_year: 2020,
					type_id: 1,
					make_id: 1,
					model_id: 1,
					sub_model_id: 1,
					transmission_id: 1,
					drive_type_id: 1,
					body_type_id: 1,
					bed_type_id: 1,
					vin: 'asdf6546541651',
					license_plate: 'T84GH3',
					insurance_number: 'A564665651',
					oil_change_frequency: 5000,
					default_energy_type_id: 2,
					default_fuel_grade_id: 1,
					note: 'Test Note'
				};
				const response = await chai
					.request(server)
					.post('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`)
					.send(newVehicle);
				expect(response).to.be.json;
				expect(response).to.have.status(201);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on'
				);
				expect(response.body.vehicle_id).to.exist;
				expect(response.body.user_id).to.exist;
				expect(response.body.vehicle_name).to.equal(newVehicle.vehicle_name);
				expect(response.body.vehicle_year).to.equal(newVehicle.vehicle_year);
				expect(response.body.type_id).to.equal(newVehicle.type_id);
				expect(response.body.make_id).to.equal(newVehicle.make_id);
				expect(response.body.model_id).to.equal(newVehicle.model_id);
				expect(response.body.sub_model_id).to.equal(newVehicle.sub_model_id);
				expect(response.body.transmission_id).to.equal(newVehicle.transmission_id);
				expect(response.body.drive_type_id).to.equal(newVehicle.drive_type_id);
				expect(response.body.body_type_id).to.equal(newVehicle.body_type_id);
				expect(response.body.bed_type_id).to.equal(newVehicle.bed_type_id);
				expect(response.body.vin).to.equal(newVehicle.vin);
				expect(response.body.license_plate).to.equal(newVehicle.license_plate);
				expect(response.body.insurance_number).to.equal(newVehicle.insurance_number);
				expect(response.body.oil_change_frequency).to.equal(newVehicle.oil_change_frequency);
				expect(response.body.default_energy_type_id).to.equal(newVehicle.default_energy_type_id);
				expect(response.body.default_fuel_grade_id).to.equal(newVehicle.default_fuel_grade_id);
				expect(response.body.note).to.equal(newVehicle.note);
				const vehicleId = response.body.vehicle_id;
				const response_2 = await chai
					.request(server)
					.get(`/api/vehicle/${vehicleId}`)
					.set('Authorization', `Bearer ${authToken}`)
				const vehicle = response_2.body[0];
				expect(vehicle).to.exist;
				expect(vehicle.vehicle_id).to.equal(response.body.vehicle_id);
				expect(vehicle.user_id).to.equal(response.body.user_id);
				expect(vehicle.vehicle_name).to.equal(response.body.vehicle_name);
				expect(vehicle.vehicle_year).to.equal(response.body.vehicle_year);
				expect(vehicle.type_id).to.equal(response.body.type_id);
				expect(vehicle.make_id).to.equal(response.body.make_id);
				expect(vehicle.model_id).to.equal(response.body.model_id);
				expect(vehicle.sub_model_id).to.equal(response.body.sub_model_id);
				expect(vehicle.transmission_id).to.equal(response.body.transmission_id);
				expect(vehicle.drive_type_id).to.equal(response.body.drive_type_id);
				expect(vehicle.body_type_id).to.equal(response.body.body_type_id);
				expect(vehicle.bed_type_id).to.equal(response.body.bed_type_id);
				expect(vehicle.vin).to.equal(response.body.vin);
				expect(vehicle.license_plate).to.equal(response.body.license_plate);
				expect(vehicle.insurance_number).to.equal(response.body.insurance_number);
				expect(vehicle.oil_change_frequency).to.equal(response.body.oil_change_frequency);
				expect(vehicle.default_energy_type_id).to.equal(response.body.default_energy_type_id);
				expect(vehicle.default_fuel_grade_id).to.equal(response.body.default_fuel_grade_id);
				expect(vehicle.note).to.equal(response.body.note);
			});
		});

		describe('PUT'.blue, () => {
			it('Should reject a vehicle update if the JWT token is missing.'.cyan, async () => {
				const updateData = {
					vehicle_name: 'nameChanged'
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].vehicle_name).to.not.equal(updateData.vehicle_name);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
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

			it('Should reject a vehicle update if the jwt token is invalid.'.cyan, async () => {
				const updateData = {
					vehicle_name: 'nameChanged'
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].vehicle_name).to.not.equal(updateData.vehicle_name);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + 'InvalidAuthToken')
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(401);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('name', 'message', 'status');
				expect(updateResponse.body.status).to.equal(401);
				expect(updateResponse.body.message).to.equal('Unauthorized');
				expect(updateResponse.body.name).to.equal('AuthenticationError');
			});

			it('Should reject a vehicle update if a field is not updatable.'.cyan, async () => {
				const updateData = {
					vehicle_id: 100
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].vehicle_id).to.not.equal(updateData.vehicle_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`'vehicle_id' is not an updateable field.`);
			});

			it('Should reject a vehicle update if the vehicle_name is not a string.'.cyan, async () => {
				const updateData = {
					vehicle_name: -5
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].vehicle_name).to.not.equal(updateData.vehicle_name);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'vehicle_name' must be a string.`);
			});

			it('Should reject a vehicle update if the vin is not a string.'.cyan, async () => {
				const updateData = {
					vin: -5
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].vin).to.not.equal(updateData.vin);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'vin' must be a string.`);
			});

			it('Should reject a vehicle update if the license_plate is not a string.'.cyan, async () => {
				const updateData = {
					license_plate: -5
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].license_plate).to.not.equal(updateData.license_plate);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'license_plate' must be a string.`);
			});

			it('Should reject a vehicle update if the insurance_number is not a string.'.cyan, async () => {
				const updateData = {
					insurance_number: -5
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].insurance_number).to.not.equal(updateData.insurance_number);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'insurance_number' must be a string.`);
			});

			it('Should reject a vehicle update if the note is not a string.'.cyan, async () => {
				const updateData = {
					note: -5
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].note).to.not.equal(updateData.note);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'note' must be a string.`);
			});

			it('Should reject a vehicle update if a string starts or ends with white spaces.'.cyan, async () => {
				const updateData = {
					vehicle_name: '    test Name'
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].vehicle_name).to.not.equal(updateData.vehicle_name);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'vehicle_name' cannot start or end with a whitespace.`);
			});

			it('Should reject a vehicle update if the vehicle_name doesn\'t have at least 1 character.'.cyan, async () => {
				const updateData = {
					vehicle_name: ''
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].vehicle_name).to.not.equal(updateData.vehicle_name);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'vehicle_name' must be at least 1 character long.`);
			});

			it('Should reject a vehicle update if the vin doesn\'t have at least 1 character.'.cyan, async () => {
				const updateData = {
					vin: ''
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].vin).to.not.equal(updateData.vin);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'vin' must be at least 1 character long.`);
			});

			it('Should reject a vehicle update if the license_plate doesn\'t have at least 1 character.'.cyan, async () => {
				const updateData = {
					license_plate: ''
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].license_plate).to.not.equal(updateData.license_plate);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'license_plate' must be at least 1 character long.`);
			});

			it('Should reject a vehicle update if the insurance_number doesn\'t have at least 1 character.'.cyan, async () => {
				const updateData = {
					insurance_number: ''
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].insurance_number).to.not.equal(updateData.insurance_number);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'insurance_number' must be at least 1 character long.`);
			});

			it('Should reject a vehicle update if the note doesn\'t have at least 1 character.'.cyan, async () => {
				const updateData = {
					note: ''
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].note).to.not.equal(updateData.note);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'note' must be at least 1 character long.`);
			});

			it('Should reject a vehicle update if the vehicle_name exceeds 35 characters.'.cyan, async () => {
				const updateData = {
					vehicle_name: 'a'.repeat(36)
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].vehicle_name).to.not.equal(updateData.vehicle_name);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'vehicle_name' must be at most 35 characters long.`);
			});

			it('Should reject a vehicle update if the vin exceeds 20 characters.'.cyan, async () => {
				const updateData = {
					vin: 'a'.repeat(21)
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].vin).to.not.equal(updateData.vin);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'vin' must be at most 20 characters long.`);
			});

			it('Should reject a vehicle update if the license_plate exceeds 20 characters.'.cyan, async () => {
				const updateData = {
					license_plate: 'a'.repeat(21)
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].license_plate).to.not.equal(updateData.license_plate);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'license_plate' must be at most 20 characters long.`);
			});

			it('Should reject a vehicle update if the insurance_number exceeds 50 characters.'.cyan, async () => {
				const updateData = {
					insurance_number: 'a'.repeat(51)
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].license_plate).to.not.equal(updateData.license_plate);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'insurance_number' must be at most 50 characters long.`);
			});

			it('Should reject a vehicle update if the note exceeds 255 characters.'.cyan, async () => {
				const updateData = {
					note: 'a'.repeat(256)
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].note).to.not.equal(updateData.note);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'note' must be at most 255 characters long.`);
			});

			it('Should reject a vehicle update if the vehicle_year is not a number.'.cyan, async () => {
				const updateData = {
					vehicle_year: 'Not a number.'
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].vehicle_year).to.not.equal(updateData.vehicle_year);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'vehicle_year' must be a number.`);
			});

			it('Should reject a vehicle update if the type_id is not a number.'.cyan, async () => {
				const updateData = {
					type_id: 'Not a number.'
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].type_id).to.not.equal(updateData.type_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'type_id' must be a number.`);
			});

			it('Should reject a vehicle update if the make_id is not a number.'.cyan, async () => {
				const updateData = {
					make_id: 'Not a number.'
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].make_id).to.not.equal(updateData.make_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'make_id' must be a number.`);
			});

			it('Should reject a vehicle update if the model_id is not a number.'.cyan, async () => {
				const updateData = {
					model_id: 'Not a number.'
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].model_id).to.not.equal(updateData.model_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'model_id' must be a number.`);
			});

			it('Should reject a vehicle update if the sub_model_id is not a number.'.cyan, async () => {
				const updateData = {
					sub_model_id: 'Not a number.'
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].sub_model_id).to.not.equal(updateData.sub_model_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'sub_model_id' must be a number.`);
			});
		
			it('Should reject a vehicle update if the transmission_id is not a number.'.cyan, async () => {
				const updateData = {
					transmission_id: 'Not a number.'
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].transmission_id).to.not.equal(updateData.transmission_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'transmission_id' must be a number.`);
			});

			it('Should reject a vehicle update if the drive_type_id is not a number.'.cyan, async () => {
				const updateData = {
					drive_type_id: 'Not a number.'
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].drive_type_id).to.not.equal(updateData.drive_type_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'drive_type_id' must be a number.`);
			});

			it('Should reject a vehicle update if the body_type_id is not a number.'.cyan, async () => {
				const updateData = {
					body_type_id: 'Not a number.'
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].body_type_id).to.not.equal(updateData.body_type_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'body_type_id' must be a number.`);
			});

			it('Should reject a vehicle update if the bed_type_id is not a number.'.cyan, async () => {
				const updateData = {
					bed_type_id: 'Not a number.'
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].bed_type_id).to.not.equal(updateData.bed_type_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'bed_type_id' must be a number.`);
			});

			it('Should reject a vehicle update if the oil_change_frequency is not a number.'.cyan, async () => {
				const updateData = {
					oil_change_frequency: 'Not a number.'
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].oil_change_frequency).to.not.equal(updateData.oil_change_frequency);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'oil_change_frequency' must be a number.`);
			});
		
			it('Should reject a vehicle update if the default_energy_type_id is not a number.'.cyan, async () => {
				const updateData = {
					default_energy_type_id: 'Not a number.'
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].default_energy_type_id).to.not.equal(updateData.default_energy_type_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'default_energy_type_id' must be a number.`);
			});

			it('Should reject a vehicle update if the default_fuel_grade_id is not a number.'.cyan, async () => {
				const updateData = {
					default_fuel_grade_id: 'Not a number.'
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].default_fuel_grade_id).to.not.equal(updateData.default_fuel_grade_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'default_fuel_grade_id' must be a number.`);
			});
		
			it('Should reject a vehicle update if the vehicle_year is not a positive number.'.cyan, async () => {
				const updateData = {
					vehicle_year: -5
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].vehicle_year).to.not.equal(updateData.vehicle_year);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'vehicle_year' must be a positive number.`);
			});

			it('Should reject a vehicle update if the type_id is not a positive number.'.cyan, async () => {
				const updateData = {
					type_id: -5
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].type_id).to.not.equal(updateData.type_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'type_id' must be a positive number.`);
			});
			
			it('Should reject a vehicle update if the make_id is not a positive number.'.cyan, async () => {
				const updateData = {
					make_id: -5
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].make_id).to.not.equal(updateData.make_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'make_id' must be a positive number.`);
			});

			it('Should reject a vehicle update if the model_id is not a positive number.'.cyan, async () => {
				const updateData = {
					model_id: -5
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].model_id).to.not.equal(updateData.model_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'model_id' must be a positive number.`);
			});

			it('Should reject a vehicle update if the sub_model_id is not a positive number.'.cyan, async () => {
				const updateData = {
					sub_model_id: -5
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].sub_model_id).to.not.equal(updateData.sub_model_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'sub_model_id' must be a positive number.`);
			});

			it('Should reject a vehicle update if the transmission_id is not a positive number.'.cyan, async () => {
				const updateData = {
					transmission_id: -5
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].transmission_id).to.not.equal(updateData.transmission_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'transmission_id' must be a positive number.`);
			});

			it('Should reject a vehicle update if the drive_type_id is not a positive number.'.cyan, async () => {
				const updateData = {
					drive_type_id: -5
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].drive_type_id).to.not.equal(updateData.drive_type_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'drive_type_id' must be a positive number.`);
			});

			it('Should reject a vehicle update if the bed_type_id is not a positive number.'.cyan, async () => {
				const updateData = {
					bed_type_id: -5
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].bed_type_id).to.not.equal(updateData.bed_type_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'bed_type_id' must be a positive number.`);
			});

			it('Should reject a vehicle update if the oil_change_frequency is not a positive number.'.cyan, async () => {
				const updateData = {
					oil_change_frequency: -5
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].oil_change_frequency).to.not.equal(updateData.oil_change_frequency);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'oil_change_frequency' must be a positive number.`);
			});

			it('Should reject a vehicle update if the default_energy_type_id is not a positive number.'.cyan, async () => {
				const updateData = {
					default_energy_type_id: -5
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].default_energy_type_id).to.not.equal(updateData.default_energy_type_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'default_energy_type_id' must be a positive number.`);
			});

			it('Should reject a vehicle update if the default_fuel_grade_id is not a positive number.'.cyan, async () => {
				const updateData = {
					default_fuel_grade_id: -5
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].default_fuel_grade_id).to.not.equal(updateData.default_fuel_grade_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'default_fuel_grade_id' must be a positive number.`);
			});

			it('Should update a vehicles vehicle_name value.'.cyan, async () => {
				const updateData = {
					vehicle_name: 'AlphaOMEGA!!!'
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].vehicle_name).to.not.equal(updateData.vehicle_name);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(200);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				expect(updateResponse.body.vehicle_name).to.equal(updateData.vehicle_name);
			});

			it('Should update a vehicles vehicle_year value.'.cyan, async () => {
				const updateData = {
					vehicle_year: 2000
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].vehicle_year).to.not.equal(updateData.vehicle_year);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(200);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				expect(updateResponse.body.vehicle_year).to.equal(updateData.vehicle_year);
			});
		
			it('Should update a vehicles type_id value.'.cyan, async () => {
				const updateData = {
					type_id: 2
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].type_id).to.not.equal(updateData.type_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(200);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				expect(updateResponse.body.type_id).to.equal(updateData.type_id);
			});
		
			it('Should update a vehicles make_id value.'.cyan, async () => {
				const updateData = {
					make_id: 2
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].make_id).to.not.equal(updateData.make_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(200);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				expect(updateResponse.body.make_id).to.equal(updateData.make_id);
			});

			it('Should update a vehicles model_id value.'.cyan, async () => {
				const updateData = {
					model_id: 2
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].model_id).to.not.equal(updateData.model_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(200);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				expect(updateResponse.body.model_id).to.equal(updateData.model_id);
			});

			it('Should update a vehicles sub_model_id value.'.cyan, async () => {
				const updateData = {
					sub_model_id: 2
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].sub_model_id).to.not.equal(updateData.sub_model_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(200);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				expect(updateResponse.body.sub_model_id).to.equal(updateData.sub_model_id);
			});

			it('Should update a vehicles transmission_id value.'.cyan, async () => {
				const updateData = {
					transmission_id: 2
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].transmission_id).to.not.equal(updateData.transmission_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(200);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				expect(updateResponse.body.transmission_id).to.equal(updateData.transmission_id);
			});

			it('Should update a vehicles drive_type_id value.'.cyan, async () => {
				const updateData = {
					drive_type_id: 2
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].drive_type_id).to.not.equal(updateData.drive_type_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(200);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				expect(updateResponse.body.drive_type_id).to.equal(updateData.drive_type_id);
			});

			it('Should update a vehicles bed_type_id value.'.cyan, async () => {
				const updateData = {
					bed_type_id: 2
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].bed_type_id).to.not.equal(updateData.bed_type_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(200);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				expect(updateResponse.body.bed_type_id).to.equal(updateData.bed_type_id);
			});

			it('Should update a vehicles vin value.'.cyan, async () => {
				const updateData = {
					vin: 'aslfdk2341234'
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].vin).to.not.equal(updateData.vin);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(200);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				expect(updateResponse.body.vin).to.equal(updateData.vin);
			});

			it('Should update a vehicles insurance_number value.'.cyan, async () => {
				const updateData = {
					insurance_number: '987654321654987'
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].insurance_number).to.not.equal(updateData.insurance_number);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(200);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				expect(updateResponse.body.insurance_number).to.equal(updateData.insurance_number);
			});

			it('Should update a vehicles oil_change_frequency value.'.cyan, async () => {
				const updateData = {
					oil_change_frequency: 7500
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].oil_change_frequency).to.not.equal(updateData.oil_change_frequency);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(200);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				expect(updateResponse.body.oil_change_frequency).to.equal(updateData.oil_change_frequency);
			});

			it('Should update a vehicles default_energy_type_id value.'.cyan, async () => {
				const updateData = {
					default_energy_type_id: 2
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].default_energy_type_id).to.not.equal(updateData.default_energy_type_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(200);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				expect(updateResponse.body.default_energy_type_id).to.equal(updateData.default_energy_type_id);
			});

			it('Should update a vehicles default_fuel_grade_id value.'.cyan, async () => {
				const updateData = {
					default_fuel_grade_id: 2
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].default_fuel_grade_id).to.not.equal(updateData.default_fuel_grade_id);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(200);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				expect(updateResponse.body.default_fuel_grade_id).to.equal(updateData.default_fuel_grade_id);
			});

			it('Should update a vehicles note value.'.cyan, async () => {
				const updateData = {
					note: 'MODIFIED NOTE!'
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].note).to.not.equal(updateData.note);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const updateResponse = await chai
					.request(server)
					.put(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(200);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				expect(updateResponse.body.note).to.equal(updateData.note);
			});
		
		});

		describe('DELETE'.red, () => {
			it('Should reject a delete if the JWT token is invalid.'.cyan, async () => {
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const deleteResponse = await chai
					.request(server)
					.delete(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + 'invalid-Token')
				expect(deleteResponse).to.be.json;
				expect(deleteResponse).to.have.status(401);
				expect(deleteResponse.body).to.be.an('object');
				expect(deleteResponse.body).to.include.keys('name', 'message', 'status');
				expect(deleteResponse.body.status).to.equal(401);
				expect(deleteResponse.body.message).to.equal(`Unauthorized`);
				expect(deleteResponse.body.name).to.equal(`AuthenticationError`);
			});

			it('Should reject a delete if the jwt token is missing.'.cyan, async () => {
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const deleteResponse = await chai
					.request(server)
					.delete(`/api/vehicle/${vehicleId}`)
				expect(deleteResponse).to.be.json;
				expect(deleteResponse).to.have.status(401);
				expect(deleteResponse.body).to.be.an('object');
				expect(deleteResponse.body).to.include.keys('name', 'message', 'status');
				expect(deleteResponse.body.status).to.equal(401);
				expect(deleteResponse.body.message).to.equal(`Unauthorized`);
				expect(deleteResponse.body.name).to.equal(`AuthenticationError`);
			});

			it('Should reject a delete if the vehicle id is not valid.'.cyan, async () => {
				const response = await chai
					.request(server)
					.delete('/api/vehicle/invalidID')
					.set('Authorization', `Bearer ${authToken}`);
				expect(response).to.be.json;
				expect(response).to.have.status(400);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(400);
				expect(response.body.message).to.equal('Invalid vehicle id.');
			});

			it('Should reject a delete if the vehicle does not exist.'.cyan, async () => {
				const response = await chai
					.request(server)
					.delete('/api/vehicle/1000')
					.set('Authorization', `Bearer ${authToken}`);
				expect(response).to.be.json;
				expect(response).to.have.status(406);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(406);
				expect(response.body.message).to.equal('Could not find a vehicle with vehicle_id: 1000.');

			});

			it('Should delete a vehicle by id.'.cyan, async () => {
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'vehicle_name',
					'vehicle_year',
					'type_id',
					'make_id',
					'model_id',
					'sub_model_id',
					'transmission_id',
					'drive_type_id',
					'body_type_id',
					'bed_type_id',
					'vin',
					'license_plate',
					'insurance_number',
					'oil_change_frequency',
					'default_energy_type_id',
					'default_fuel_grade_id',
					'note',
					'created_on',
					'modified_on');
				const vehicleId = response.body[0].vehicle_id;
				const deleteResponse = await chai
					.request(server)
					.delete(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
				expect(deleteResponse).to.have.status(204);
				const response_2 = await chai
					.request(server)
					.get(`/api/vehicle/${vehicleId}`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response_2).to.be.json;
				expect(response_2).to.have.status(200);
				expect(response_2.body).to.be.an('array');
				expect(response_2.body.length).to.equal(0);
			});
		});
	});
});