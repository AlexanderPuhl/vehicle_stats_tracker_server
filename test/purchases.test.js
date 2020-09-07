/* eslint-disable */
const app = require('../server');
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { TEST_DATABASE_URL, JWT_SECRET } = require('../config');

const User = require('../models/user');
const Vehicle = require('../models/vehicle');
const Purchase = require('../models/purchase');

const seedUsers = require('../db/seed/users.json');
const seedVehicles = require('../db/seed/vehicles.json');
const seedPurchases = require('../db/seed/purchases.json');

chai.use(chaiHttp);

describe('Purchases API Resources', () => {
  let user;
  let token;

  before(function() {
    return mongoose
      .connect(TEST_DATABASE_URL)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function() {
    return Promise.all([
      User.insertMany(seedUsers),
      User.createIndexes(),

      Vehicle.insertMany(seedVehicles),
      Vehicle.createIndexes(),

      Purchase.insertMany(seedPurchases),
      Purchase.createIndexes(),
    ]).then(([users]) => {
      user = users[0];
      token = jwt.sign({ user }, JWT_SECRET, { subject: user.username });
    });
  });

  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    return mongoose.disconnect();
  });

  describe('api/purchases', function() {
    describe('GET', function() {
      it('Should return all existing purchases for a user', function() {
        return chai
          .request(app)
          .get('/api/purchases')
          .set('Authorization', `Bearer ${token}`)
          .then((res) => {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.an('array');
            expect(res.body[0]).to.include.keys(
              'miles',
              'amount',
              'price',
              'userId',
              'vehicleId',
              'createdAt',
              'updatedAt',
              'id',
            );
          });
      });
      it('Should return an error if the userId is missing', function() {
        return chai
          .request(app)
          .get('/api/purchases')
          .set('Authorization', `Bearer`)
          .then((res) => {
            expect(res).to.have.status(401);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.include.keys('name', 'message', 'status');
            expect(res.body.name).to.equal('AuthenticationError');
            expect(res.body.message).to.equal('Unauthorized');
          });
      });
    });
    describe('POST', function() {
      it('Should create and return a new purchase when provided valid data', function() {
        const newPurchase = {
          miles: 3200,
          amount: 14,
          price: 3,
          vehicleId: '111111111111111111111101',
        };
        return chai
          .request(app)
          .post('/api/purchases')
          .set('Authorization', `Bearer ${token}`)
          .send(newPurchase)
          .then((res) => {
            expect(res).to.have.status(201);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.include.keys(
              'miles',
              'amount',
              'price',
              'userId',
              'vehicleId',
              'createdAt',
              'updatedAt',
              'id',
            );
          });
      });
      it('Should return a 400 when the miles field is missing', function() {
        const newPurchase = {
          amount: 14,
          price: 3,
          vehicleId: '111111111111111111111101',
        };
        return chai
          .request(app)
          .post('/api/purchases')
          .set('Authorization', `Bearer ${token}`)
          .send(newPurchase)
          .then((res) => {
            expect(res).to.have.status(400);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.include.keys('status', 'message');
            expect(res.body.message).to.equal(
              'Missing the `miles` in the request body',
            );
          });
      });
      it('Should return a 400 when the amount field is missing', function() {
        const newPurchase = {
          miles: 3500,
          price: 3,
          vehicleId: '111111111111111111111101',
        };
        return chai
          .request(app)
          .post('/api/purchases')
          .set('Authorization', `Bearer ${token}`)
          .send(newPurchase)
          .then((res) => {
            expect(res).to.have.status(400);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.include.keys('status', 'message');
            expect(res.body.message).to.equal(
              'Missing the `amount` in the request body',
            );
          });
      });
      it('Should return a 400 when the price field is missing', function() {
        const newPurchase = {
          miles: 3500,
          amount: 14,
          vehicleId: '111111111111111111111101',
        };
        return chai
          .request(app)
          .post('/api/purchases')
          .set('Authorization', `Bearer ${token}`)
          .send(newPurchase)
          .then((res) => {
            expect(res).to.have.status(400);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.include.keys('status', 'message');
            expect(res.body.message).to.equal(
              'Missing the `price` in the request body',
            );
          });
      });
      it('Should return a 400 when the vehicleId field is missing', function() {
        const newPurchase = {
          miles: 3500,
          amount: 14,
          price: 3,
        };
        return chai
          .request(app)
          .post('/api/purchases')
          .set('Authorization', `Bearer ${token}`)
          .send(newPurchase)
          .then((res) => {
            expect(res).to.have.status(400);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.include.keys('status', 'message');
            expect(res.body.message).to.equal(
              'Missing the `vehicleId` in the request body',
            );
          });
      });
      it('Should return a 400 if the miles is a negative number', function() {
        const newPurchase = {
          miles: -1,
          amount: 14,
          price: 3,
          vehicleId: '111111111111111111111101',
        };
        return chai
          .request(app)
          .post('/api/purchases')
          .set('Authorization', `Bearer ${token}`)
          .send(newPurchase)
          .then((res) => {
            expect(res).to.have.status(400);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.include.keys('status', 'message');
            expect(res.body.message).to.equal(
              'The miles must be a positive number.',
            );
          });
      });
      it('Should return a 400 if the amount is a negative number', function() {
        const newPurchase = {
          miles: 400,
          amount: -1,
          price: 3,
          vehicleId: '111111111111111111111101',
        };
        return chai
          .request(app)
          .post('/api/purchases')
          .set('Authorization', `Bearer ${token}`)
          .send(newPurchase)
          .then((res) => {
            expect(res).to.have.status(400);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.include.keys('status', 'message');
            expect(res.body.message).to.equal(
              'The amount must be a positive number.',
            );
          });
      });
      it('Should return a 400 if the price is a negative number', function() {
        const newPurchase = {
          miles: 400,
          amount: 14,
          price: -1,
          vehicleId: '111111111111111111111101',
        };
        return chai
          .request(app)
          .post('/api/purchases')
          .set('Authorization', `Bearer ${token}`)
          .send(newPurchase)
          .then((res) => {
            expect(res).to.have.status(400);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.include.keys('status', 'message');
            expect(res.body.message).to.equal(
              'The price must be a positive number.',
            );
          });
      });
      it('Should return a 400 when a field is not valid', function() {
        const newPurchase = {
          invalidField: 'invalid',
          amount: 14,
          price: 3,
          vehicleId: '111111111111111111111101',
        };
        return chai
          .request(app)
          .post('/api/purchases')
          .set('Authorization', `Bearer ${token}`)
          .send(newPurchase)
          .then((res) => {
            expect(res).to.have.status(400);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.include.keys('status', 'message');
            expect(res.body.message).to.equal(
              'Missing the `miles` in the request body',
            );
          });
      });
      it('Should return a 400 if the miles is less than the miles of the last purchase', function() {
        const newPurchase = {
          miles: '1',
          amount: 14,
          price: 3,
          vehicleId: '111111111111111111111101',
        };
        return chai
          .request(app)
          .post('/api/purchases')
          .set('Authorization', `Bearer ${token}`)
          .send(newPurchase)
          .then((res) => {
            expect(res).to.have.status(400);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.include.keys('status', 'message');
            expect(res.body.message).to.equal(
              'Miles must be later than the miles in the previous submission.',
            );
          });
      });
    });
    describe('DELETE', function() {
      it('Should delete a purchase by id', function() {
        return chai
          .request(app)
          .delete(`/api/purchases/222222222222222222222208`)
          .set('Authorization', `Bearer ${token}`)
          .then((res) => {
            expect(res).to.have.status(204);
          });
      });
      it('Should return an error when the purchase id is not valid', function() {
        return chai
          .request(app)
          .delete(`/api/purchases/invalid`)
          .set('Authorization', `Bearer ${token}`)
          .then((res) => {
            expect(res).to.have.status(400);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.include.keys('status', 'message');
            expect(res.body.message).to.equal('The `id` is not valid');
          });
      });
      it('Should return an error when the purchase id is missing', function() {
        return chai
          .request(app)
          .delete(`/api/purchases`)
          .set('Authorization', `Bearer ${token}`)
          .then((res) => {
            expect(res).to.have.status(404);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.include.keys('status', 'message');
            expect(res.body.message).to.equal('Not Found');
          });
      });
    });
  });
});
