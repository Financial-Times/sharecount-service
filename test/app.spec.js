'use strict';
const chai = require('chai');
const request = require('supertest');
const sinon = require('sinon');

chai.should();

const app = require('../app');
const healthcheck = require('../healthcheck');

describe('App', () => {
  before(done => {
    app.listen(9999, done);
  });

  it('has a /__gtg endpoint which returns 200', (done) => {
    request(app)
      .get('/__gtg')
      .expect(200, done);
  });
});

describe('Healthcheck', () => {

  describe('when a request fails', () => {

    it('should return the error', (done) => {

      const facebook = {
        "fetch": () => {
          return {
            "then": (callback) => {
              return callback([{"error": 'wah'}]);
            }
          };
        }
      };

      healthcheck([facebook]).then((data) => {
        data[0][0].error.should.equal('wah');
        done();
      });
    });
  });

  describe('when a request is successful', () => {

    it('should work when appropriate', (done) => {

      const facebook = {
        "fetch": () => {
          return {
            "then": (callback) => {
              return callback([{"url": "www.ft.com"}]);
            }
          };
        }
      };

      healthcheck([facebook]).then((data) => {
        data[0][0].url.should.equal('www.ft.com');
        done();
      });
    });
  });
});
