/* eslint-disable */
const app = require('../server');
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { JWT_SECRET, TEST_DATABASE_URL } = require('../config');

const User = require('../models/user');
const seedUsers = require('../db/seed/users');

chai.use(chaiHttp);

describe('Users API Resources', function() {
  const name = 'testName';
  const email = 'test@test.com';
  const username = 'testUsername';
  const password = 'testPassword';

  before(function() {
    return mongoose
      .connect(TEST_DATABASE_URL)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function() {
    return Promise.all([User.insertMany(seedUsers), User.createIndexes()]).then(
      ([users]) => {
        user = users[0];
        token = jwt.sign({ user }, JWT_SECRET, { subject: user.username });
      },
    );
  });

  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    return mongoose.disconnect();
  });

  describe('api/users', function() {
    describe('POST', function() {
      it('Should create a new user', function() {
        const testUser = {
          name,
          email,
          username,
          password,
        };

        let res;
        return chai
          .request(app)
          .post('/api/users/create')
          .send(testUser)
          .then((_res) => {
            res = _res;
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
              'id',
              'name',
              'email',
              'username',
              'resetToken',
              'onboarding',
              'selectedVehicle',
              'resetTokenExpiration',
            );
            expect(res.body.id).to.exist;
            expect(res.body.name).to.equal(testUser.name);
            expect(res.body.email).to.equal(testUser.email);
            expect(res.body.username).to.equal(testUser.username);
            expect(res.body.resetToken).to.equal(null);
            expect(res.body.onboarding).to.equal(true);
            expect(res.body.selectedVehicle).to.equal(null);
            expect(res.body.resetTokenExpiration).to.equal(null);
            return User.findOne({ username });
          })
          .then((user) => {
            expect(user).to.exist;
            expect(user.id).to.equal(res.body.id);
            expect(user.name).to.equal(testUser.name);
            expect(user.email).to.equal(testUser.email);
            expect(user.username).to.equal(testUser.username);
            expect(user.resetToken).to.equal(res.body.resetToken);
            expect(user.onboarding).to.equal(res.body.onboarding);
            expect(user.selectedVehicle).to.equal(res.body.selectedVehicle);
            expect(user.resetTokenExpiration).to.equal(
              res.body.resetTokenExpiration,
            );
            return user.validatePassword(password);
          })
          .then((isValid) => {
            expect(isValid).to.be.true;
          });
      });

      it('Should reject users with a missing username', function() {
        const testUser = { name, email, password };
        return chai
          .request(app)
          .post('/api/users/create')
          .send(testUser)
          .then((res) => {
            const message = JSON.parse(res.text).message;
            expect(message).to.equal("Missing 'username' in request body");
            expect(res).to.have.status(422);
          });
      });

      it('Should reject users with a missing password', function() {
        const testUser = { name, email, username };
        return chai
          .request(app)
          .post('/api/users/create')
          .send(testUser)
          .then((res) => {
            const message = JSON.parse(res.text).message;
            expect(message).to.equal("Missing 'password' in request body");
            expect(res).to.have.status(422);
          });
      });

      it('Should reject users with a non-string username', function() {
        const nonStringUserName = 456;
        const testUser = {
          name,
          email,
          username: nonStringUserName,
          password,
        };
        return chai
          .request(app)
          .post('/api/users/create')
          .send(testUser)
          .then((res) => {
            const message = JSON.parse(res.text).message;
            expect(message).to.equal("Field: 'username' must be type String");
            expect(res).to.have.status(422);
          });
      });

      it('Should reject users with non-string password', function() {
        const nonStringPassword = 358;
        const testUser = {
          name,
          email,
          username,
          password: nonStringPassword,
        };
        return chai
          .request(app)
          .post('/api/users/create')
          .send(testUser)
          .then((res) => {
            const message = JSON.parse(res.text).message;
            expect(message).to.equal("Field: 'password' must be type String");
            expect(res).to.have.status(422);
          });
      });

      it('Should reject users with non-trimmed username', function() {
        const nonTrimmedUsername = '   user';
        const testUser = {
          name,
          email,
          username: nonTrimmedUsername,
          password,
        };
        return chai
          .request(app)
          .post('/api/users/create')
          .send(testUser)
          .then((res) => {
            const message = JSON.parse(res.text).message;
            expect(message).to.equal(
              "Field: 'username' cannot start or end with whitespace",
            );
            expect(res).to.have.status(422);
          });
      });

      it('Should reject users with non-trimmed password', function() {
        const nonTrimmedPassword = '   password';
        const testUser = {
          name,
          email,
          username,
          password: nonTrimmedPassword,
        };
        return chai
          .request(app)
          .post('/api/users/create')
          .send(testUser)
          .then((res) => {
            const message = JSON.parse(res.text).message;
            expect(message).to.equal(
              "Field: 'password' cannot start or end with whitespace",
            );
            expect(res).to.have.status(422);
          });
      });

      it('Should reject users with empty username', function() {
        const emptyUsername = '';
        const testUser = {
          name,
          email,
          username: emptyUsername,
          password,
        };
        return chai
          .request(app)
          .post('/api/users/create')
          .send(testUser)
          .then((res) => {
            const message = JSON.parse(res.text).message;
            expect(message).to.equal(
              "Field: 'username' must be at least 1 characters long",
            );
            expect(res).to.have.status(422);
          });
      });

      it('Should reject users with password less than 10 characters', function() {
        const smallPassword = '123456789';
        const testUser = {
          name,
          email,
          username,
          password: smallPassword,
        };
        return chai
          .request(app)
          .post('/api/users/create')
          .send(testUser)
          .then((res) => {
            const message = JSON.parse(res.text).message;
            expect(message).to.equal(
              "Field: 'password' must be at least 10 characters long",
            );
            expect(res).to.have.status(422);
          });
      });

      it('Should reject users with password greater than 72 characters', function() {
        const longPassword = 'a'.repeat(74);
        const testUser = {
          name,
          email,
          username,
          password: longPassword,
        };
        return chai
          .request(app)
          .post('/api/users/create')
          .send(testUser)
          .then((res) => {
            const message = JSON.parse(res.text).message;
            expect(message).to.equal(
              "Field: 'password' must be at most 72 characters long",
            );
            expect(res).to.have.status(422);
          });
      });

      it('Should reject users with duplicate username', function() {
        const testUser = {
          name,
          email,
          username,
          password,
        };
        return chai
          .request(app)
          .post('/api/users/create')
          .send(testUser)
          .then(() => {
            return chai
              .request(app)
              .post('/api/users/create')
              .send(testUser)
              .then((res) => {
                const message = JSON.parse(res.text).message;
                expect(message).to.equal(
                  'The username or email already exists',
                );
                expect(res).to.have.status(400);
              });
          });
      });
    });
    describe('PUT', function() {
      it('Should update a users name value', function() {
        const validUser = { username: 'alpha', password: 'thinkful123' };

        const updateData = {
          name: 'AlphaOMEGA!!!',
        };

        let res;
        let authToken;
        return chai
          .request(app)
          .post('/api/login/')
          .send(validUser)
          .then((_res) => {
            res = _res;
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.include.keys('authToken');
            authToken = res.body.authToken;
            return chai
              .request(app)
              .put('/api/users/update')
              .set('authorization', 'Bearer ' + authToken)
              .send(updateData);
          })
          .then((res) => {
            expect(res).to.have.status(200);
            expect(res).to.be.an('object');
            expect(res.body).to.include.keys(
              'id',
              'name',
              'email',
              'username',
              'resetToken',
              'onboarding',
              'selectedVehicle',
              'resetTokenExpiration',
            );
            expect(res.body.username).to.equal(validUser.username);
            expect(res.body.name).to.equal(updateData.name);
          });
      });

      it('Should update a users onboarding value', function() {
        const validUser = { username: 'alpha', password: 'thinkful123' };

        const updateData = {
          onboarding: false,
        };

        let res;
        let authToken;
        return chai
          .request(app)
          .post('/api/login/')
          .send(validUser)
          .then((_res) => {
            res = _res;
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.include.keys('authToken');
            authToken = res.body.authToken;
            return chai
              .request(app)
              .put('/api/users/update')
              .set('authorization', 'Bearer ' + authToken)
              .send(updateData);
          })
          .then((res) => {
            expect(res).to.have.status(200);
            expect(res).to.be.an('object');
            expect(res.body).to.include.keys(
              'id',
              'name',
              'email',
              'username',
              'resetToken',
              'onboarding',
              'selectedVehicle',
              'resetTokenExpiration',
            );
            expect(res.body.username).to.equal(validUser.username);
            expect(res.body.onboarding).to.equal(updateData.onboarding);
          });
      });

      it('Should update a users selectedVehicle value', function() {
        const validUser = { username: 'alpha', password: 'thinkful123' };

        const updateData = {
          selectedVehicle: '5c4afa977205200017f46bb3',
        };

        let res;
        let authToken;
        return chai
          .request(app)
          .post('/api/login/')
          .send(validUser)
          .then((_res) => {
            res = _res;
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.include.keys('authToken');
            authToken = res.body.authToken;
            return chai
              .request(app)
              .put('/api/users/update')
              .set('authorization', 'Bearer ' + authToken)
              .send(updateData);
          })
          .then((res) => {
            expect(res).to.have.status(200);
            expect(res).to.be.an('object');
            expect(res.body).to.include.keys(
              'id',
              'name',
              'email',
              'username',
              'resetToken',
              'onboarding',
              'selectedVehicle',
              'resetTokenExpiration',
            );
            expect(res.body.username).to.equal(validUser.username);
            expect(res.body.selectedVehicle).to.equal(
              updateData.selectedVehicle,
            );
          });
      });

      it('Should return a 401 if the jwt token is missing', function() {
        const updateData = {
          onboarding: false,
        };

        return chai
          .request(app)
          .put('/api/users/update')
          .set('authorization', 'Bearer ')
          .send(updateData)
          .then((res) => {
            expect(res).to.have.status(401);
            expect(res).to.be.an('object');
            expect(res.body).to.include.keys('name', 'message', 'status');
            expect(res.body.name).to.equal('AuthenticationError');
            expect(res.body.message).to.equal('Unauthorized');
          });
      });

      it('Should return a 401 if the jwt token is invalid', function() {
        const updateData = {
          onboarding: false,
        };

        let authToken = 'invalid';

        return chai
          .request(app)
          .put('/api/users/update')
          .set('authorization', 'Bearer ' + authToken)
          .send(updateData)
          .then((res) => {
            expect(res).to.have.status(401);
            expect(res).to.be.an('object');
            expect(res.body).to.include.keys('name', 'message', 'status');
            expect(res.body.name).to.equal('AuthenticationError');
            expect(res.body.message).to.equal('Unauthorized');
          });
      });

      it('Should return a 400 if a field is invalid', function() {
        const validUser = { username: 'alpha', password: 'thinkful123' };

        const updateData = {
          fake: 'fake',
        };

        let res;
        let authToken;
        return chai
          .request(app)
          .post('/api/login/')
          .send(validUser)
          .then((_res) => {
            res = _res;
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.include.keys('authToken');
            authToken = res.body.authToken;
            return chai
              .request(app)
              .put('/api/users/update')
              .set('authorization', 'Bearer ' + authToken)
              .send(updateData);
          })
          .then((res) => {
            expect(res).to.have.status(400);
            expect(res).to.be.an('object');
            expect(res.body).to.include.keys('status', 'message');
            expect(res.body.status).to.equal(400);
            expect(res.body.message).to.equal(`fake is not a valid field`);
          });
      });
    });
  });
});
