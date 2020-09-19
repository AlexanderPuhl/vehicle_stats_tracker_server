process.env.NODE_ENV = 'test';

const bcrypt = require('bcryptjs');
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const server = require('../server');
const knex = require('../db/knex');
const { JWT_SECRET, JWT_EXPIRATION } = require('../config');
const { userController } = require('../controllers');

chai.use(chaiHttp);

describe('Users API Resources'.cyan.bold.underline, () => {
	let authToken = '';
	const jwtPayload = {
		user_id: 1,
		username: 'demo',
		email: 'demo@demo.com',
		iat: Date.now()
	};
	const validUser = { username: 'demo', password: 'thinkful123' };
	const name = 'testName';
	const email = 'test@test.com';
	const username = 'testUsername';
	const password = 'testPassword';

	beforeEach(() => knex.migrate.rollback()
		.then(() => knex.migrate.latest())
		.then(() => knex.seed.run())
		.then(() => {
			authToken = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: JWT_EXPIRATION, algorithm: 'HS256' });
		})
	);

	afterEach(() => knex.migrate.rollback());

	describe('api/users'.cyan.bold, () => {
		describe('POST'.yellow, () => {
			it('Should reject users with an invalid field.'.cyan, async () => {
				const invalidField = 'invalidField';
				const newUser = {
					invalidField,
					name,
					email,
					username,
					password
				};
				const response = await chai
					.request(server)
					.post('/api/user/create')
					.send(newUser);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`'invalidField' is not a valid field.`);
			})

			it('Should reject users when a required field is missing.'.cyan, async () => {
				const newUser = { name, email, password };
				const response = await chai
					.request(server)
					.post('/api/user/create')
					.send(newUser);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Missing 'username' in request body.`);
			});

			it('Should reject users when a string field is not a string.'.cyan, async () => {
				const nonStringUserName = 456;
				const newUser = {
					name,
					email,
					username: nonStringUserName,
					password,
				};
				const response = await chai
					.request(server)
					.post('/api/user/create')
					.send(newUser);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'username' must be a string.`);
			});

			it('Should reject users when a field starts or ends with whitespaces.'.cyan, async () => {
				const nonTrimmedUsername = '   user';
				const newUser = {
					name,
					email,
					username: nonTrimmedUsername,
					password,
				};
				const response = await chai
					.request(server)
					.post('/api/user/create')
					.send(newUser);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'username' cannot start or end with a whitespace.`);
			});

			it('Should reject a vehicle when a field doens\'t have at least 1 character.'.cyan, async () => {
				const emptyUsername = '';
				const newUser = {
					name,
					email,
					username: emptyUsername,
					password,
				};
				const response = await chai
					.request(server)
					.post('/api/user/create')
					.send(newUser);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'username' must be at least 1 character long.`);
			});

			it('Should reject users when the email isn\'t at least 3 characters long'.cyan, async () => {
				const emailTooSmall = 'a';
				const newUser = {
					name,
					email: emailTooSmall,
					username,
					password,
				};
				const response = await chai
					.request(server)
					.post('/api/user/create')
					.send(newUser);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'email' must be at least 3 characters long.`);
			});

			it('Should reject users with password less than 8 characters.'.cyan, async () => {
				const smallPassword = '1234567';
				const newUser = {
					name,
					email,
					username,
					password: smallPassword,
				};
				const response = await chai
					.request(server)
					.post('/api/user/create')
					.send(newUser);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'password' must be at least 8 characters long.`);
			});

			it('Should reject users with password greater than 72 characters.'.cyan, async () => {
				const longPassword = 'a'.repeat(73);
				const newUser = {
					name,
					email,
					username,
					password: longPassword,
				};
				const response = await chai
					.request(server)
					.post('/api/user/create')
					.send(newUser);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'password' must be at most 72 characters long.`);
			});

			it('Should reject users when a number field is not a number.'.cyan, async () => {
				const nonIntField = 'nonIntField';
				const newUser = {
					name,
					email,
					username,
					password,
					selected_vehicle_id: nonIntField
				};
				const response = await chai
					.request(server)
					.post('/api/user/create')
					.send(newUser);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'selected_vehicle_id' must be a number.`);
			});

			it('Should reject users when a number field is not a positive number.'.cyan, async () => {
				const negativeInt = -5;
				const newUser = {
					name,
					email,
					username,
					password,
					selected_vehicle_id: negativeInt
				};
				const response = await chai
					.request(server)
					.post('/api/user/create')
					.send(newUser);
				expect(response).to.be.json;
				expect(response).to.have.status(422);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(422);
				expect(response.body.message).to.equal(`Field: 'selected_vehicle_id' must be a positive number.`);
			});

			it('Should reject users with duplicate username.'.cyan, async () => {
				const newUser = {
					name,
					email,
					username,
					password,
				};
				await chai
					.request(server)
					.post('/api/user/create')
					.send(newUser);
				const response = await chai
					.request(server)
					.post('/api/user/create')
					.send(newUser);
				expect(response).to.be.json;
				expect(response).to.have.status(400);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('status', 'message');
				expect(response.body.status).to.equal(400);
				expect(response.body.message).to.equal('The username or email already exists.');
			});

			it('Should create a new user'.cyan, async () => {
				const newUser = {
					name,
					email,
					username,
					password,
				};

				const response = await chai
					.request(server)
					.post('/api/user/create')
					.send(newUser);
				expect(response).to.be.json;
				expect(response).to.have.status(201);
				expect(response.body).to.be.an('object');
				expect(response.body).to.have.keys(
					'user_id',
					'name',
					'email',
					'username',
					'onboarding',
					'selected_vehicle_id',
					'reset_token',
					'reset_token_expiration');
				expect(response.body.user_id).to.exist;
				expect(response.body.name).to.equal(newUser.name);
				expect(response.body.email).to.equal(newUser.email);
				expect(response.body.username).to.equal(newUser.username);
				expect(response.body.onboarding).to.equal(true);
				expect(response.body.selected_vehicle_id).to.equal(0);
				expect(response.body.reset_token).to.equal(null);
				expect(response.body.reset_token_expiration).to.equal(null);
				const user = await userController.findOne(username);
				expect(user).to.exist;
				expect(user.user_id).to.equal(response.body.user_id);
				expect(user.name).to.equal(newUser.name);
				expect(user.email).to.equal(newUser.email);
				expect(user.username).to.equal(newUser.username);
				expect(user.onboarding).to.equal(response.body.onboarding);
				expect(user.selected_vehicle_id).to.equal(response.body.selected_vehicle_id);
				expect(user.reset_token).to.equal(response.body.reset_token);
				expect(user.reset_token_expiration).to.equal(response.body.reset_token_expiration);
				const isValid = await bcrypt.compare(newUser.password, user.password);
				expect(isValid).to.be.true;
			});
		});

		describe('PUT'.blue, () => {
			it('Should reject an update if the jwt token is missing.'.cyan, async () => {
				const updateData = {
					onboarding: false
				};
				const response = await chai
					.request(server)
					.put('/api/user/update')
					.set('authorization', 'Bearer ')
					.send(updateData);
				expect(response).to.be.json;
				expect(response).to.have.status(401);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('name', 'message', 'status');
				expect(response.body.status).to.equal(401);
				expect(response.body.message).to.equal('Unauthorized');
				expect(response.body.name).to.equal('AuthenticationError');
			});

			it('Should reject an update if the jwt token is invalid.'.cyan, async () => {
				const authToken = 'invalid';
				const updateData = {
					onboarding: false
				};
				const response = await chai
					.request(server)
					.put('/api/user/update')
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(response).to.be.json;
				expect(response).to.have.status(401);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('name', 'message', 'status');
				expect(response.body.status).to.equal(401);
				expect(response.body.message).to.equal('Unauthorized');
				expect(response.body.name).to.equal('AuthenticationError');
			});

			it('Should reject an update if a field is invalid.'.cyan, async () => {
				const updateData = {
					fake: 'fake'
				};
				const loginResponse = await chai
					.request(server)
					.post('/api/user/login/')
					.send(validUser);
				expect(loginResponse).to.be.json;
				expect(loginResponse).to.have.status(200);
				expect(loginResponse.body).to.be.an('object');
				expect(loginResponse.body).to.include.keys('authToken');
				const authToken = loginResponse.body.authToken;
				const updateResponse = await chai
					.request(server)
					.put('/api/user/update')
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`'fake' is not a valid field.`);
			});

			it('Should reject an update if a field is not updatable.'.cyan, async () => {
				const updateData = {
					username: 'fake'
				};
				const loginResponse = await chai
					.request(server)
					.post('/api/user/login/')
					.send(validUser);
				expect(loginResponse).to.be.json;
				expect(loginResponse).to.have.status(200);
				expect(loginResponse.body).to.be.an('object');
				expect(loginResponse.body).to.include.keys('authToken');
				const authToken = loginResponse.body.authToken;
				const updateResponse = await chai
					.request(server)
					.put('/api/user/update')
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`'username' is not an updateable field.`);
			});

			it('Should reject an update if a string field is not a string.'.cyan, async () => {
				const updateData = {
					name: -5
				};
				const loginResponse = await chai
					.request(server)
					.post('/api/user/login/')
					.send(validUser);
				expect(loginResponse).to.be.json;
				expect(loginResponse).to.have.status(200);
				expect(loginResponse.body).to.be.an('object');
				expect(loginResponse.body).to.include.keys('authToken');
				const authToken = loginResponse.body.authToken;
				const updateResponse = await chai
					.request(server)
					.put('/api/user/update')
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
				const loginResponse = await chai
					.request(server)
					.post('/api/user/login/')
					.send(validUser);
				expect(loginResponse).to.be.json;
				expect(loginResponse).to.have.status(200);
				expect(loginResponse.body).to.be.an('object');
				expect(loginResponse.body).to.include.keys('authToken');
				const authToken = loginResponse.body.authToken;
				const updateResponse = await chai
					.request(server)
					.put('/api/user/update')
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
					email: 'a'
				};
				const loginResponse = await chai
					.request(server)
					.post('/api/user/login/')
					.send(validUser);
				expect(loginResponse).to.be.json;
				expect(loginResponse).to.have.status(200);
				expect(loginResponse.body).to.be.an('object');
				expect(loginResponse.body).to.include.keys('authToken');
				const authToken = loginResponse.body.authToken;
				const updateResponse = await chai
					.request(server)
					.put('/api/user/update')
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'email' must be at least 3 characters long.`);
			});

			it('Should reject an update if a string exceeds the maximum number of characters.'.cyan, async () => {
				const longName = 'a'.repeat(71);
				const updateData = {
					name: longName
				};
				const loginResponse = await chai
					.request(server)
					.post('/api/user/login/')
					.send(validUser);
				expect(loginResponse).to.be.json;
				expect(loginResponse).to.have.status(200);
				expect(loginResponse.body).to.be.an('object');
				expect(loginResponse.body).to.include.keys('authToken');
				const authToken = loginResponse.body.authToken;
				const updateResponse = await chai
					.request(server)
					.put('/api/user/update')
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'name' must be at most 70 characters long.`);
			});

			it('Should reject an update if a number field is not a number.'.cyan, async () => {
				const updateData = {
					selected_vehicle_id: 'not a Number'
				};
				const loginResponse = await chai
					.request(server)
					.post('/api/user/login/')
					.send(validUser);
				expect(loginResponse).to.be.json;
				expect(loginResponse).to.have.status(200);
				expect(loginResponse.body).to.be.an('object');
				expect(loginResponse.body).to.include.keys('authToken');
				const authToken = loginResponse.body.authToken;
				const updateResponse = await chai
					.request(server)
					.put('/api/user/update')
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'selected_vehicle_id' must be a number.`);
			});

			it('Should reject an update if a number field is not a positive number.'.cyan, async () => {
				const updateData = {
					selected_vehicle_id: -5
				};
				const loginResponse = await chai
					.request(server)
					.post('/api/user/login/')
					.send(validUser);
				expect(loginResponse).to.be.json;
				expect(loginResponse).to.have.status(200);
				expect(loginResponse.body).to.be.an('object');
				expect(loginResponse.body).to.include.keys('authToken');
				const authToken = loginResponse.body.authToken;
				const updateResponse = await chai
					.request(server)
					.put('/api/user/update')
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(updateResponse).to.be.json;
				expect(updateResponse).to.have.status(422);
				expect(updateResponse.body).to.be.an('object');
				expect(updateResponse.body).to.include.keys('status', 'message');
				expect(updateResponse.body.status).to.equal(422);
				expect(updateResponse.body.message).to.equal(`Field: 'selected_vehicle_id' must be a positive number.`);
			});

			it('Should update a users name value.'.cyan, async () => {
				const updateData = {
					name: 'AlphaOMEGA!!!'
				};
				const response = await chai
					.request(server)
					.post('/api/user/login/')
					.send(validUser);
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('authToken');
				const authToken = response.body.authToken;
				const response_2 = await chai
					.request(server)
					.put('/api/user/update')
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(response).to.be.json;
				expect(response_2).to.have.status(200);
				expect(response_2.body).to.be.an('object');
				expect(response_2.body).to.include.keys(
					'user_id',
					'username',
					'email',
					'name',
					'selected_vehicle_id',
					'onboarding',
					'created_on',
					'last_login',
					'modified_on',
					'reset_token',
					'reset_token_expiration');
				expect(response_2.body.username).to.equal(validUser.username);
				expect(response_2.body.name).to.equal(updateData.name);
			});

			it('Should update a users onboarding value.'.cyan, async () => {
				const updateData = {
					onboarding: false
				};
				const response = await chai
					.request(server)
					.post('/api/user/login/')
					.send(validUser);
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('authToken');
				const authToken = response.body.authToken;
				const response_2 = await chai
					.request(server)
					.put('/api/user/update')
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(response).to.be.json;
				expect(response_2).to.have.status(200);
				expect(response_2.body).to.be.an('object');
				expect(response_2.body).to.include.keys(
					'user_id',
					'username',
					'email',
					'name',
					'selected_vehicle_id',
					'onboarding',
					'created_on',
					'last_login',
					'modified_on',
					'reset_token',
					'reset_token_expiration');
				expect(response_2.body.username).to.equal(validUser.username);
				expect(response_2.body.onboarding).to.equal(updateData.onboarding);
			});

			it('Should update a users selectedVehicle value.'.cyan, async () => {
				const updateData = {
					selected_vehicle_id: 2,
				};
				const response = await chai
					.request(server)
					.post('/api/user/login')
					.send(validUser);
				expect(response).to.be.json;
				expect(response).to.have.status(200);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('authToken');
				const authToken = response.body.authToken;
				const response_2 = await chai
					.request(server)
					.put('/api/user/update')
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(response).to.be.json;
				expect(response_2).to.have.status(200);
				expect(response_2.body).to.be.an('object');
				expect(response_2.body).to.include.keys(
					'user_id',
					'username',
					'email',
					'name',
					'selected_vehicle_id',
					'onboarding',
					'created_on',
					'last_login',
					'modified_on',
					'reset_token',
					'reset_token_expiration');
				expect(response_2.body.username).to.equal(validUser.username);
				expect(response_2.body.selectedVehicle).to.equal(updateData.selectedVehicle);
			});
		});

		describe('DELETE'.red, () => {
			it('Should reject a delete if the JWT token is invalid.'.cyan, async () => {
				const authToken = 'invalid-Token';
				const response = await chai
					.request(server)
					.delete('/api/user/delete')
					.set('authorization', 'Bearer ' + authToken)
				expect(response).to.be.json;
				expect(response).to.have.status(401);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('name', 'message', 'status');
				expect(response.body.status).to.equal(401);
				expect(response.body.message).to.equal(`Unauthorized`);
				expect(response.body.name).to.equal(`AuthenticationError`);
			});

			it('Should reject a delete if the jwt token is missing.'.cyan, async () => {
				const response = await chai
					.request(server)
					.delete('/api/user/delete')
				expect(response).to.be.json;
				expect(response).to.have.status(401);
				expect(response.body).to.be.an('object');
				expect(response.body).to.include.keys('name', 'message', 'status');
				expect(response.body.status).to.equal(401);
				expect(response.body.message).to.equal(`Unauthorized`);
				expect(response.body.name).to.equal(`AuthenticationError`);
			});

			it('Should delete a user with a valid JWT Token.'.cyan, async () => {
				const loginResponse = await chai
					.request(server)
					.post('/api/user/login/')
					.send(validUser);
				expect(loginResponse).to.be.json;
				expect(loginResponse).to.have.status(200);
				expect(loginResponse.body).to.be.an('object');
				expect(loginResponse.body).to.include.keys('authToken');
				const authToken = loginResponse.body.authToken;
				const deleteResponse = await chai
					.request(server)
					.delete('/api/user/delete')
					.set('authorization', 'Bearer ' + authToken)
				expect(deleteResponse).to.have.status(204);
			});
		});
	});
});