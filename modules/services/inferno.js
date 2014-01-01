var req = require('request');
var deferred = require('deferred');

exports.fetch = function(urls, metrics) {
	var def = deferred(), ops=[], opurls=[], ref, data;

	// Reduce list to just FT.com URLs
	urls.forEach(function(url) {
		if (url.match(/^https?\:\/\/(www\.)?ft\.com/)) {
			ops.push({method:'getCounts', args: {ref:url.replace(/^.*\/([\w\-]{36}).*$/, '$1')}});
			opurls.push(url);
		}
	});
	if (!ops.length) {
		def.resolve([]);
		return def.promise;
	}

	// Send the request
	req({
		method: 'POST',
		url: "http://api.fueltheinferno.com/api3",
		body: JSON.stringify({
			site: 15,
			output: {format: 'json', themed: false, data: true},
			operations: ops
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	}, function(err, respobj, resp) {
		var opresults = JSON.parse(resp), respmap = {}, results = [];

		// Match up the returned counts with the original list of URLs
		if (opresults.length) {
			opresults.forEach(function(opres, i) {
				if (opres.publiccommentcount) respmap[opurls[i]] = parseInt(opres.publiccommentcount, 10);
			});
		}
		urls.forEach(function(url) {
			results.push({url:url, metric:'comments', count:(respmap[url] ? respmap[url] : 0)});
		})
		def.resolve(results);
	});
	return def.promise;
}

exports.getMetrics = function() {
	return ['comments'];
}
