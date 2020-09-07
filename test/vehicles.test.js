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

const seedUsers = require('../db/seed/users.json');
const seedVehicles = require('../db/seed/vehicles.json');

chai.use(chaiHttp);

describe('Vehicles API Resources', () => {
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

  describe('api/vehicles', function() {
    describe('GET', function() {
      it('should return all existing vehicles for a user', function() {
        return chai
          .request(app)
          .get('/api/vehicles')
          .set('Authorization', `Bearer ${token}`)
          .then((res) => {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.an('array');
            expect(res.body[0]).to.include.keys(
              'vehicleName',
              'oilChangeFrequency',
              'userId',
              'createdAt',
              'updatedAt',
              'id',
            );
          });
      });
    });

    describe('POST', function() {
      it('Should create and return a new vehicle when provided valid data', function() {
        const newVehicle = {
          vehicleName: 'testVehicle',
          oilChangeFrequency: 5000,
        };
        return chai
          .request(app)
          .post('/api/vehicles')
          .set('Authorization', `Bearer ${token}`)
          .send(newVehicle)
          .then((res) => {
            expect(res).to.have.status(201);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.include.keys(
              'vehicleName',
              'oilChangeFrequency',
              'userId',
              'createdAt',
              'updatedAt',
              'id',
            );
          });
      });

      it('Should return a 400 when a field is missing', function() {
        const newVehicle = {
          oilChangeFrequency: 5000,
        };
        return chai
          .request(app)
          .post('/api/vehicles')
          .set('Authorization', `Bearer ${token}`)
          .send(newVehicle)
          .then((res) => {
            expect(res).to.have.status(400);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.include.keys('status', 'message');
            expect(res.body.message).to.equal('vehicleName is required');
          });
      });

      it('Should return a 400 when a field is not valid', function() {
        const newVehicle = {
          invalidField: 'testVehicle',
          oilChangeFrequency: 5000,
        };
        return chai
          .request(app)
          .post('/api/vehicles')
          .set('Authorization', `Bearer ${token}`)
          .send(newVehicle)
          .then((res) => {
            expect(res).to.have.status(400);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.include.keys('status', 'message');
            expect(res.body.message).to.equal(
              'invalidField is not a valid field',
            );
          });
      });
    });

    describe('DELETE', function() {
      it('Should delete a vehicle by id', function() {
        let data;
        return Vehicle.findOne({ userId: user.id })
          .then((_data) => {
            data = _data;
            return chai
              .request(app)
              .delete(`/api/vehicles/${data.id}`)
              .set('Authorization', `Bearer ${token}`);
          })
          .then((res) => {
            expect(res).to.have.status(204);
            return Vehicle.find({ id: data.id, userId: user.id });
          })
          .then((res) => {
            expect(res).to.be.an('array');
            expect(res.length).to.equal(0);
          });
      });

      it('Should return an error when vehicle id is not valid', function() {
        let data;
        return chai
          .request(app)
          .delete('/api/vehicles/invalidID')
          .set('Authorization', `Bearer ${token}`)
          .then((res) => {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Invalid vehicleId');
          });
      });
    });
  });
});
