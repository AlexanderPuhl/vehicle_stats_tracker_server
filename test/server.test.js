/* eslint-disable */
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Environment', () => {
  it('Node_ENV should be "test"', () => {
    expect(process.env.NODE_ENV).to.equal('test');
  });
});

describe('Basic Express setup', () => {
  describe('404 handler', () => {
    it('should respond with 404 when given a bad path', () =>
      chai
        .request(app)
        .get('/bad/path')
        .then((res) => {
          expect(res).to.have.status(404);
        }));
  });
});
