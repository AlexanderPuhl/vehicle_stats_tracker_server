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
			it('should return all existing vehicles for a user.'.cyan, async () => {
				const response = await chai
					.request(server)
					.get('/api/vehicle')
					.set('Authorization', `Bearer ${authToken}`);
				const vehicle = response.body[0];
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(vehicle).to.include.keys(
					'vehicle_id',
					'user_id',
					'name',
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

			it('should return a specific vehicles for a user.'.cyan, async () => {
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
					'name',
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
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys(
					'vehicle_id',
					'user_id',
					'name',
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
			it('Should create a new vehicle.'.cyan, async () => {
				const newVehicle = {
					name: 'testVehicle',
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
					'name',
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
				expect(response.body.name).to.equal(newVehicle.name);
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
				const vehicle = response_2.body;
				expect(vehicle).to.exist;
				expect(vehicle.vehicle_id).to.equal(response.body.vehicle_id);
				expect(vehicle.user_id).to.equal(response.body.user_id);
				expect(vehicle.name).to.equal(response.body.name);
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

			it('Should reject vehicles with an invalid field.'.cyan, async () => {
				const invalidField = 'invalidField';
				const newVehicle = {
					name: 'testVehicle',
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
				expect(response.body.message).to.equal('invalidField is not a valid field.');
			});

			it('Should reject vehicles when a required field is missing.'.cyan, async () => {
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
				expect(response.body.message).to.equal('name is required.');
			});

			it('Should reject vehicles when a string field is not a string.'.cyan, async () => {
				const nonStringField = 5;
				const newVehicle = {
					name: nonStringField,
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
				expect(response.body.message).to.equal(`Field: 'name' must be a string.`);
			});

			it('Should reject a vehicle when a field starts or ends with whitespaces.'.cyan, async () => {
				const nonTrimmedField = '   Kia';
				const newVehicle = {
					name: nonTrimmedField,
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
				expect(response.body.message).to.equal(`Field: 'name' cannot start or end with a whitespace.`);
			});

			it('Should reject a vehicle when a field doens\'t have at least 1 character.'.cyan, async () => {
				const emptyName = '';
				const newVehicle = {
					name: emptyName,
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
				expect(response.body.message).to.equal(`Field: 'name' must be at least 1 character long.`);
			});

			it('Should reject a vehicle when a field exceeds the maximum number of characters.'.cyan, async () => {
				const fieldTooLarge = 'a'.repeat(36);
				const newVehicle = {
					name: fieldTooLarge,
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
				expect(response.body.message).to.equal(`Field: 'name' must be at most 35 characters long.`);
			});

			it('Should reject a vehicle when a number field is not a number.'.cyan, async () => {
				const nonIntField = 'nonIntField';
				const newVehicle = {
					name: 'testVehicle',
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

			it('Should reject a vehicle when a number field is not a positive number.'.cyan, async () => {
				const negativeInt = -5;
				const newVehicle = {
					name: 'testVehicle',
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

		});

		describe('PUT'.blue, () => {
			it('Should update a vehicles name value.'.cyan, async () => {
				const updateData = {
					name: 'AlphaOMEGA!!!'
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].name).to.not.equal(updateData.name);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'name',
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
					'name',
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
				expect(updateResponse.body.name).to.equal(updateData.name);
			});

			it('Should reject an update if the JWT token is missing.'.cyan, async () => {
				const updateData = {
					name: 'nameChanged'
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].name).to.not.equal(updateData.name);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'name',
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

			it('Should reject an update if the jwt token is invalid.'.cyan, async () => {
				const updateData = {
					name: 'nameChanged'
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].name).to.not.equal(updateData.name);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'name',
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

			it('Should reject an update if a field is not updatable.'.cyan, async () => {
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
				expect(response.body[0].name).to.not.equal(updateData.name);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'name',
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

			it('Should reject an update if a string field is not a string.'.cyan, async () => {
				const updateData = {
					name: -5
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].name).to.not.equal(updateData.name);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'name',
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
				expect(updateResponse.body.message).to.equal(`Field: 'name' must be a string.`);
			});

			it('Should reject an update if a string starts or ends with white spaces.'.cyan, async () => {
				const updateData = {
					name: '    test Name'
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].name).to.not.equal(updateData.name);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'name',
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
				expect(updateResponse.body.message).to.equal(`Field: 'name' cannot start or end with a whitespace.`);
			});

			it('Should reject an update if a string doesn\'t have the minimun number of characters.'.cyan, async () => {
				const updateData = {
					name: ''
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].name).to.not.equal(updateData.name);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'name',
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
				expect(updateResponse.body.message).to.equal(`Field: 'name' must be at least 1 character long.`);
			});

			it('Should reject an update if a string exceeds the maximum number of characters.'.cyan, async () => {
				const updateData = {
					name: 'a'.repeat(36)
				};
				const response = await chai
					.request(server)
					.get(`/api/vehicle`)
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('array');
				expect(response.body[0]).to.be.an('object');
				expect(response.body[0].name).to.not.equal(updateData.name);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'name',
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
				expect(updateResponse.body.message).to.equal(`Field: 'name' must be at most 35 characters long.`);
			});

			it('Should reject an update if a number field is not a number.'.cyan, async () => {
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
				expect(response.body[0].name).to.not.equal(updateData.name);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'name',
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

			it('Should reject an update if a number field is not a positive number.'.cyan, async () => {
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
				expect(response.body[0].name).to.not.equal(updateData.name);
				expect(response.body[0]).to.include.keys(
					'vehicle_id',
					'user_id',
					'name',
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

		});

		describe('DELETE'.red, () => {
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
					'name',
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
				expect(deleteResponse).to.be.json;
				expect(deleteResponse).to.have.status(200);
				expect(deleteResponse.body).to.be.an('object');
				expect(deleteResponse.body).to.include.keys('message');
				expect(deleteResponse.body.message).to.equal('Vehicle deleted.');
			});

			it('Should return a 400 when the vehicle id is not valid.'.cyan, async () => {
				const response = await chai
					.request(server)
					.delete('/api/vehicle/invalidID')
					.set('Authorization', `Bearer ${authToken}`);
				expect(response).to.be.json;
				expect(response).to.have.status(400);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(400);
				expect(response.body.message).to.equal('Invalid vehicleId.');
			});

			it('Should return a 406 when vehicle does not exist.'.cyan, async () => {
				const response = await chai
					.request(server)
					.delete('/api/vehicle/1000')
					.set('Authorization', `Bearer ${authToken}`);
				expect(response).to.be.json;
				expect(response).to.have.status(406);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(406);
				expect(response.body.message).to.equal('Could not find vehicle with vehicle_id: 1000.');

			});

			it('Should return a 401 if the JWT token is invalid.'.cyan, async () => {
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
					'name',
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

			it('Should return a 401 if the jwt token is missing.'.cyan, async () => {
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
					'name',
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

		});
	});
});