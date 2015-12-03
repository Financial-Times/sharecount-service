'use strict';
const chai = require('chai');
chai.should();
const request = require('supertest');

const app = require('../app');
const healthcheck = require('../healthcheck')

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
	var foo;

	beforeEach(function(done){
		var promise = healthcheck();
		promise.then(function(value){
			foo = value;
			done();
		}).catch(err => {
			foo = err;
			done();
		});
	});

	it('should error when appropriate', function(){
		// test to be added
	});
});
