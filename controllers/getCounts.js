/*
 * getCounts controller
 *
 * URL controller for /getCounts, fetches interaction counts from multiple services and aggregates the results
 */

var deferred = require('deferred');
var _ = require('lodash');
var Memcached = require('memcached');
var config = require('../config');

var mcprefix = 'ft-sharecount-service-';
var mcttl = 3600;

module.exports = function(req, res) {
	var urls, services, servicebackends = {}, metrics, itemmap = {}, keylist = [], results = [], memcached, groupby, data = {};

	// Validate inputs
	if (!req.query.urls) throw('No urls specified');
	if (!req.query.services) throw('No services specified');
	if (!req.query.metrics) throw('No metrics specified');
	urls = req.query.urls.split(',');
	services = req.query.services.split(',');
	metrics = req.query.metrics.split(',');
	if (req.query.groupby !== undefined) {
		groupby = req.query.groupby ? req.query.groupby.split(',') : [];
	} else {
		groupby = ['service', 'url', 'metric'];
	}

	// Open handles to service backends
	services.forEach(function(servicename) {
		servicebackends[servicename] = require('../modules/services/'+servicename+'.js');
	})

	// Create a single flat list of items needed so they can be searched for in cache.  Only list combos that make sense (eg there is no 'endorse' action supported by twitter)
	urls.forEach(function(x) {
		services.forEach(function(y) {
			metrics.forEach(function(z) {
				if (servicebackends[y].getMetrics().indexOf(z) !== -1) {
					var key = mcprefix+md5([x,y,z]);
					keylist.push(key);
					itemmap[key] = {url:x,service:y,metric:z};
				}
			});
		})
	})

	// Get as many of the results from memcache as possible
	memcached = new Memcached(config.memcached.servers, config.memcached.options);
	memcached.getMulti(keylist, function(err, cacheres) {
		var cachestats = {cached:0,fresh:0};
		keylist.forEach(function(i) {
			if (cacheres[i]) {
				results.push(cacheres[i]);
				delete itemmap[i];
				cachestats.cached++;
			}
		});

		// For those items not fulfiled from memcache, make a fresh list of urls, services and metrics to fetch from source
		urls = [];
		services = [];
		metrics = [];
		for (var i in itemmap) {
			if (urls.indexOf(itemmap[i].url) === -1) urls.push(itemmap[i].url);
			if (services.indexOf(itemmap[i].service) === -1) services.push(itemmap[i].service);
			if (metrics.indexOf(itemmap[i].metric) === -1) metrics.push(itemmap[i].metric);
		}

		// If there are any, look them up asyncronously
		if (services.length) {
			deferred.map(services, function(servicename) {
				var start = (new Date()).getTime();
				return servicebackends[servicename].fetch(urls, metrics)(function(result) {
					if (result) {

						// Add the service name to each returned result, and cache it (memcached requires a callback even though it's not used here)
						result = result.map(function(i) {
							i.service = servicename;
							memcached.set(mcprefix+md5([i.url,i.service,i.metric]), i, mcttl, function() {});
							cachestats.fresh++;
							return i;
						})
						results = results.concat(result);
					}
					return result;
				});
			})(andAggregate);
		} else {
			andAggregate();
		}

		function andAggregate() {
			results.forEach(function(item) {
				var resultslot;
				if (!groupby) {
					data += item.count;
				} else {
					resultslot = groupby.map(function(by) {
						return item[by];
					});
					addToValue(data, item.count, resultslot);
				}
			});
			if (!groupby.length) data = data.undefined;
			if (req.query.autoscale) data = autoScale(data);
			if (req.query.debug) data.debug = {cache:cachestats};
			res.jsonp(data);
		}
	});
}

function addToValue(obj, value, path) {
    var parent = obj;
    for (var i = 0; i < path.length -1; i += 1) {
        if (parent[path[i]] === undefined) parent[path[i]] = {};
        parent = parent[path[i]];
    }
    if (parent[path[path.length-1]] === undefined) {
        parent[path[path.length-1]] = 0;
    }
    parent[path[path.length-1]] += value;
}

function autoScale(data) {
	if (typeof data === 'object') {
		for (var i in data) data[i] = autoScale(data[i]);
		return data;
	} else if (typeof data === 'number') {
		if (data < 10000) return (data+'').replace(/^(\d)(\d{3})$/, '$1,$2');
		if (data < 100000) return (Math.round(data/100)/10)+'K';
		if (data < 1000000) return Math.round(data/1000)+'K';
		if (data < 100000000) return (Math.round(data/100000)/10)+'M';
		if (data < 1000000000) return Math.round(data/1000000)+'M';
		return (Math.round(number/100000000)/10)+'G';
	} else {
		return data;
	}
}

function md5(data) {
	if (Array.isArray(data)) data = data.join(',');
	return require('crypto').createHash('md5').update(data).digest("hex");
}
