var deferred = require('deferred'),
Memcached = require('memcached'),
_ = require('lodash'),
timeout = 1000;

var genericServiceCheck = {
	businessImpact: "Interaction counts from this service will not be available, so share count totals may be lower than expected, and may take longer to load than normal (which may slow down page loading on some pages, depending on how they integrate share counts)",
	technicalSummary: "Checks for the share count of http://www.ft.com on the specified service",
	panicGuide: "Could be that we're being blocked by the service provider (may need to contact support), or their API could be down (check social media to see if others are reporting the same), or perhaps there's a network issue preventing this service from making outbound HTTP requests to the service provider (check network and firewall configs).",
	severity: 2,
	func: function(def, service, metric) {
		require('./services/'+service+'.js').fetch(['http://www.ft.com'], [metric])(function(result) {
			if (Array.isArray(result) && result[0].url) {
				def.resolve(true);
			} else {
				var err = new Error('Check failure');
				err.output = result;
				def.reject(err);
			}
		});
	}
}

var checks = [
	{
		name: "Memcached",
		func: function(def) {
			memcached = new Memcached('127.0.0.1:11211', {timeout:50});
			memcached.set('test', '1', 10, function(err) {
				if (err) def.reject(err);
 			});
			memcached.get('test', function(err, cacheres) {
				if (cacheres) {
					def.resolve(true);
				} else if (err) {
					def.reject(err);
				}
			});
		}
	},
	_.extend({}, genericServiceCheck, {
		name: "Twitter",
		func: function(def) { return genericServiceCheck.func(def, 'twitter', 'shares'); }
	}),
	_.extend({}, genericServiceCheck, {
		name: "Stumbleupon",
		func: function(def) { return genericServiceCheck.func(def, 'stumbleupon', 'shares'); }
	}),
	_.extend({}, genericServiceCheck, {
		name: "Reddit",
		func: function(def) { return genericServiceCheck.func(def, 'reddit', 'endorsements'); }
	}),
	_.extend({}, genericServiceCheck, {
		name: "Pinterest",
		func: function(def) { return genericServiceCheck.func(def, 'pinterest', 'shares'); }
	}),
	_.extend({}, genericServiceCheck, {
		name: "LinkedIn",
		func: function(def) { return genericServiceCheck.func(def, 'linkedin', 'shares'); }
	}),
	_.extend({}, genericServiceCheck, {
		name: "Google Plus",
		func: function(def) { return genericServiceCheck.func(def, 'gplus', 'shares'); }
	}),
	_.extend({}, genericServiceCheck, {
		name: "Facebook",
		func: function(def) { return genericServiceCheck.func(def, 'facebook', 'shares'); }
	}),
	_.extend({}, genericServiceCheck, {
		name: "Delicious",
		func: function(def) { return genericServiceCheck.func(def, 'delicious', 'shares'); }
	})
];

exports.get = function(callback) {
	var key, promiselist = [];
	deferred.map(checks, function(check) {
		var def = deferred();
		var def2 = deferred();
		setTimeout(function() { def.reject(new Error("Timeout: check did not complete within "+timeout+"ms")) }, timeout);
		check.func(def);
		def.promise.done(function() {
			def2.resolve(_.extend({}, _.pick(check, ['name', 'check']), {ok:true}))
		}, function(err) {
			def2.resolve(_.extend({}, _.pick(check, ['name', 'check', 'businessImpact', 'technicalImpact', 'panicGuide', 'severity']), {ok:false, checkOutput:err.output?JSON.stringify(err.output):err.toString()}));
		});
		return def2.promise;
	})(function(data) {
		callback(data);
	})
}
