'use strict';
const chai = require('chai');
const request = require('supertest');
const sinon = require('sinon');

chai.should();

const app = require('../app');
const healthcheck = require('../healthcheck');

describe('App', function(){
	before(done => {
		app.listen(9999, done);
	});

	it('has a /__gtg endpoint which returns 200', function(done) {
		request(app)
			.get('/__gtg')
			.expect(200, done);
	});
});

describe('Healthcheck', function(){
  it('should error when appropriate', function(done){
    const facebook = require('../modules/services/facebook');

    const successStub = {
      "fetch": function () {
        return {
          "then": function (callback) {
            return callback([{"url": "www.ft.com"}]);
          }
        };
      }
    };

    const checks = [successStub];

    healthcheck(checks).then((data) => {
      console.log(data);
      done();
    });
  });
});
