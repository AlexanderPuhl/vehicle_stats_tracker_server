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

describe('Users API Resources', () => {
	const jwtPayload = {
		user_id: 1,
		username: 'demo',
		email: 'demo@demo.com',
		iat: Date.now()
	};

	const name = 'testName';
	const email = 'test@test.com';
	const username = 'testUsername';
	const password = 'testPassword';

	let token;

	beforeEach(() => knex.migrate.rollback()
		.then(() => knex.migrate.latest())
		.then(() => knex.seed.run())
		.then(() => {
			token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: JWT_EXPIRATION, algorithm: 'HS256' });
		})
	);

	afterEach(() => knex.migrate.rollback());

	describe('api/users', () => {
		describe('POST', () => {
			it('Should create a new user', async () => {
				const testUser = {
					name,
					email,
					username,
					password,
				};

				let res;
				const _res = await chai
					.request(server)
					.post('/api/user/create')
					.send(testUser);
				res = _res;
				expect(res).to.have.status(201);
				expect(res.body).to.be.an('object');
				expect(res.body).to.have.keys(
					'user_id',
					'name',
					'email',
					'username',
					'onboarding',
					'selected_vehicle_id',
					'reset_token',
					'reset_token_expiration');
				expect(res.body.user_id).to.exist;
				expect(res.body.name).to.equal(testUser.name);
				expect(res.body.email).to.equal(testUser.email);
				expect(res.body.username).to.equal(testUser.username);
				expect(res.body.onboarding).to.equal(true);
				expect(res.body.selected_vehicle_id).to.equal(0);
				expect(res.body.reset_token).to.equal(null);
				expect(res.body.reset_token).to.equal(null);
				const user = await userController.findOne(username);
				expect(user).to.exist;
				expect(user.user_id).to.equal(res.body.user_id);
				expect(user.name).to.equal(testUser.name);
				expect(user.email).to.equal(testUser.email);
				expect(user.username).to.equal(testUser.username);
				expect(user.onboarding).to.equal(res.body.onboarding);
				expect(user.selected_vehicle_id).to.equal(res.body.selected_vehicle_id);
				expect(user.reset_token).to.equal(res.body.reset_token);
				expect(user.reset_token_expiration).to.equal(res.body.reset_token_expiration);
				const isValid = await bcrypt.compare(testUser.password, user.password);
				expect(isValid).to.be.true;
			});

			it('Should reject users with a missing username', async () => {
				const testUser = { name, email, password };
				const res = await chai
					.request(server)
					.post('/api/user/create')
					.send(testUser);
				const message = JSON.parse(res.text).message;
				expect(message).to.equal("Missing 'username' in request body.");
				expect(res).to.have.status(422);
			});

			it('Should reject users with a missing password', async () => {
				const testUser = { name, email, username };
				const res = await chai
					.request(server)
					.post('/api/user/create')
					.send(testUser);
				const message = JSON.parse(res.text).message;
				expect(message).to.equal("Missing 'password' in request body.");
				expect(res).to.have.status(422);
			});

			it('Should reject users with a non-string username', async () => {
				const nonStringUserName = 456;
				const testUser = {
					name,
					email,
					username: nonStringUserName,
					password,
				};
				const res = await chai
					.request(server)
					.post('/api/user/create')
					.send(testUser);
				const message = JSON.parse(res.text).message;
				expect(message).to.equal("Field: 'username' must be type String.");
				expect(res).to.have.status(422);
			});

			it('Should reject users with non-string password', async () => {
				const nonStringPassword = 358;
				const testUser = {
					name,
					email,
					username,
					password: nonStringPassword,
				};
				const res = await chai
					.request(server)
					.post('/api/user/create')
					.send(testUser);
				const message = JSON.parse(res.text).message;
				expect(message).to.equal("Field: 'password' must be type String.");
				expect(res).to.have.status(422);
			});

			it('Should reject users with non-trimmed username', async () => {
				const nonTrimmedUsername = '   user';
				const testUser = {
					name,
					email,
					username: nonTrimmedUsername,
					password,
				};
				const res = await chai
					.request(server)
					.post('/api/user/create')
					.send(testUser);
				const message = JSON.parse(res.text).message;
				expect(message).to.equal("Field: 'username' cannot start or end with a whitespace.");
				expect(res).to.have.status(422);
			});

			it('Should reject users with non-trimmed password', async () => {
				const nonTrimmedPassword = '   password';
				const testUser = {
					name,
					email,
					username,
					password: nonTrimmedPassword,
				};
				const res = await chai
					.request(server)
					.post('/api/user/create')
					.send(testUser);
				const message = JSON.parse(res.text).message;
				expect(message).to.equal("Field: 'password' cannot start or end with a whitespace.");
				expect(res).to.have.status(422);
			});

			it('Should reject users with empty username', async () => {
				const emptyUsername = '';
				const testUser = {
					name,
					email,
					username: emptyUsername,
					password,
				};
				const res = await chai
					.request(server)
					.post('/api/user/create')
					.send(testUser);
				const message = JSON.parse(res.text).message;
				expect(message).to.equal("Field: 'username' must be at least 1 characters long.");
				expect(res).to.have.status(422);
			});

			it('Should reject users with password less than 10 characters', async () => {
				const smallPassword = '123456789';
				const testUser = {
					name,
					email,
					username,
					password: smallPassword,
				};
				const res = await chai
					.request(server)
					.post('/api/user/create')
					.send(testUser);
				const message = JSON.parse(res.text).message;
				expect(message).to.equal("Field: 'password' must be at least 10 characters long.");
				expect(res).to.have.status(422);
			});

			it('Should reject users with password greater than 72 characters', async () => {
				const longPassword = 'a'.repeat(73);
				const testUser = {
					name,
					email,
					username,
					password: longPassword,
				};
				const res = await chai
					.request(server)
					.post('/api/user/create')
					.send(testUser);
				const message = JSON.parse(res.text).message;
				expect(message).to.equal("Field: 'password' must be at most 72 characters long.");
				expect(res).to.have.status(422);
			});

			it('Should reject users with duplicate username', async () => {
				const testUser = {
					name,
					email,
					username,
					password,
				};
				await chai
					.request(server)
					.post('/api/user/create')
					.send(testUser);
				const res = await chai
					.request(server)
					.post('/api/user/create')
					.send(testUser);
				const message = JSON.parse(res.text).message;
				expect(message).to.equal('The username or email already exists.');
				expect(res).to.have.status(400);
			});

		});

		describe('PUT', () => {
			it('Should update a users name value', async () => {
				const validUser = { username: 'demo', password: 'thinkful123' };

				const updateData = {
					name: 'AlphaOMEGA!!!'
				};

				let res;
				let authToken;
				const _res = await chai
					.request(server)
					.post('/api/user/login/')
					.send(validUser);
				res = _res;
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body).to.include.keys('authToken');
				authToken = res.body.authToken;
				const res_1 = await chai
					.request(server)
					.put('/api/user')
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(res_1).to.have.status(200);
				expect(res_1).to.be.an('object');
				expect(res_1.body).to.include.keys(
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
				expect(res_1.body.username).to.equal(validUser.username);
				expect(res_1.body.name).to.equal(updateData.name);
			});

			it('Should update a users onboarding value', async () => {
				const validUser = { username: 'demo', password: 'thinkful123' };

				const updateData = {
					onboarding: false,
				};

				let res;
				let authToken;
				const _res = await chai
					.request(server)
					.post('/api/user/login/')
					.send(validUser);
				res = _res;
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body).to.include.keys('authToken');
				authToken = res.body.authToken;
				const res_1 = await chai
					.request(server)
					.put('/api/user')
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(res_1).to.have.status(200);
				expect(res_1).to.be.an('object');
				expect(res_1.body).to.include.keys(
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
				expect(res_1.body.username).to.equal(validUser.username);
				expect(res_1.body.onboarding).to.equal(updateData.onboarding);
			});

			it('Should update a users selectedVehicle value', async () => {
				const validUser = { username: 'demo', password: 'thinkful123' };

				const updateData = {
					selected_vehicle_id: 2,
				};

				let res;
				let authToken;
				const _res = await chai
					.request(server)
					.post('/api/user/login')
					.send(validUser);
				res = _res;
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body).to.include.keys('authToken');
				authToken = res.body.authToken;
				const res_1 = await chai
					.request(server)
					.put('/api/user')
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(res_1).to.have.status(200);
				expect(res_1).to.be.an('object');
				expect(res_1.body).to.include.keys(
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
				expect(res_1.body.username).to.equal(validUser.username);
				expect(res_1.body.selectedVehicle).to.equal(
					updateData.selectedVehicle);
			});

			it('Should return a 401 if the jwt token is missing', async () => {
				const updateData = {
					onboarding: false,
				};

				const res = await chai
					.request(server)
					.put('/api/user')
					.set('authorization', 'Bearer ')
					.send(updateData);
				expect(res).to.have.status(401);
				expect(res).to.be.an('object');
				expect(res.body).to.include.keys('name', 'message', 'status');
				expect(res.body.name).to.equal('AuthenticationError');
				expect(res.body.message).to.equal('Unauthorized');
			});

			it('Should return a 401 if the jwt token is invalid', async () => {
				const updateData = {
					onboarding: false,
				};

				let authToken = 'invalid';

				const res = await chai
					.request(server)
					.put('/api/user')
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(res).to.have.status(401);
				expect(res).to.be.an('object');
				expect(res.body).to.include.keys('name', 'message', 'status');
				expect(res.body.name).to.equal('AuthenticationError');
				expect(res.body.message).to.equal('Unauthorized');
			});

			it('Should return a 400 if a field is invalid', async () => {
				const validUser = { username: 'demo', password: 'thinkful123' };

				const updateData = {
					fake: 'fake',
				};

				let res;
				let authToken;
				const _res = await chai
					.request(server)
					.post('/api/user/login/')
					.send(validUser);
				res = _res;
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body).to.include.keys('authToken');
				authToken = res.body.authToken;
				const res_1 = await chai
					.request(server)
					.put('/api/user')
					.set('authorization', 'Bearer ' + authToken)
					.send(updateData);
				expect(res_1).to.have.status(400);
				expect(res_1).to.be.an('object');
				expect(res_1.body).to.include.keys('status', 'message');
				expect(res_1.body.status).to.equal(400);
				expect(res_1.body.message).to.equal(`fake is not a valid field.`);
			});

		});

		describe('DELETE', () => {
			it('Should delete a user with a valid JWT Token', async () => {
				const validUser = { username: 'demo', password: 'thinkful123' };

				let res;
				let authToken;
				const _res = await chai
					.request(server)
					.post('/api/user/login/')
					.send(validUser);
				res = _res;
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body).to.include.keys('authToken');
				authToken = res.body.authToken;
				const res_1 = await chai
					.request(server)
					.delete('/api/user')
					.set('authorization', 'Bearer ' + authToken)
				expect(res_1).to.have.status(200);
				expect(res_1).to.be.an('object');
				expect(res_1.body).to.include.keys('message');
				expect(res_1.body.message).to.equal(`User account deleted.`);
			});
			it('Should return a 401 if the JWT token is invalid', async () => {
				const authToken = 'invalid-Token';
				const res_1 = await chai
					.request(server)
					.delete('/api/user')
					.set('authorization', 'Bearer ' + authToken)
				expect(res_1).to.have.status(401);
				expect(res_1).to.be.an('object');
				expect(res_1.body).to.include.keys('name', 'message', 'status');
				expect(res_1.body.message).to.equal(`Unauthorized`);
			});

			it('Should return a 401 if the jwt token is missing', async () => {
				const res_1 = await chai
					.request(server)
					.delete('/api/user')
				expect(res_1).to.have.status(401);
				expect(res_1).to.be.an('object');
				expect(res_1.body).to.include.keys('name', 'message', 'status');
				expect(res_1.body.message).to.equal(`Unauthorized`);
			});

		});
	});

});
