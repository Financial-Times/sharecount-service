/*
 * getCounts controller
 *
 * URL controller for /getCounts, fetches interaction counts from multiple services and aggregates the results
 */

var deferred = require('deferred');
var _ = require('lodash');

module.exports = function(req, res) {
	var urls, services, metrics, groupby, def, data = {};
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

	deferred.map(services, function(servicename) {
		var start = (new Date()).getTime();
		var service = require('../services/'+servicename+'.js');
		return service.fetch(urls, metrics)(function(result) {
			var reqtime = (new Date()).getTime() - start;
			console.log(servicename, reqtime+'ms');
			if (result) {
				result.forEach(function(item) {
					var resultslot;
					_.extend(item, {service:servicename});
					if (!groupby) {
						data += item.count;
					} else {
						resultslot = groupby.map(function(by) {
							return item[by];
						});
						addToValue(data, item.count, resultslot);
					}
				});
			}
			return result;
		});
	})(function(results) {
		if (!groupby.length) data = data.undefined;
		if (req.query.autoscale) data = autoScale(data);
		res.jsonp(data);
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
