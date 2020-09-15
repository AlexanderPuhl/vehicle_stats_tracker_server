/* eslint-disable */
process.env.NODE_ENV = 'test';

const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const server = require('../server');
const knex = require('../db/knex');


const { JWT_SECRET, JWT_EXPIRATION } = require('../config');

chai.use(chaiHttp);

describe('Auth API resources', () => {
	let user = {
		user_id: 1,
		username: 'demo',
		email: 'demo@demo.com',
		iat: Date.now()
	};

	let token;

	beforeEach(() => knex.migrate.rollback()
		.then(() => knex.migrate.latest())
		.then(() => knex.seed.run())
		.then(() => {
			token = jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRATION, algorithm: 'HS256' });
		})
	);

	afterEach(() => knex.migrate.rollback());

	describe('POST api/user/login', () => {
		it('should return a 401 if you attempt to login with a username not in the database ', async () => {
			const userNotInDatabase = 'fiasnfsnafiasofnisn';
			const inValidUser = { username: userNotInDatabase, password: 'password' };
			const res = await chai
				.request(server)
				.post('/api/user/login/')
				.send(inValidUser);
			expect(res).to.have.status(401);
			expect(res.body.message).to.equal('Unauthorized');
		});

		it('should return a 401 if you attempt to login with a password that is not correct', async () => {
			const incorrectPassword = 'fiasnfsnafiasofnisn';
			const inValidUser = { username: 'bobuser', password: incorrectPassword };
			const res = await chai
				.request(server)
				.post('/api/user/login/')
				.send(inValidUser);
			expect(res).to.have.status(401);
			expect(res.body.message).to.equal('Unauthorized');
		});

		it('should return a valid jwt if your username is in the database and the password is correct', async () => {
			const validUser = { username: 'demo', password: 'thinkful123' };
			const res = await chai
				.request(server)
				.post('/api/user/login/')
				.send(validUser);
			expect(res).to.have.status(200);
			expect(res).to.be.json;
			expect(res.body).to.include.keys('authToken');
		});
	});

	describe('POST api/user/refresh', () => {
		it('should return a valid jwt if you have a valid jwt', async () => {
			const res = await chai
				.request(server)
				.post('/api/user/refresh/')
				.set('Authorization', `Bearer ${token}`);
			expect(res).to.have.status(200);
			expect(res).to.be.json;
			expect(res.body).to.include.keys('authToken');
		});
	});
});