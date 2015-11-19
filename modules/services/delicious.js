/*
 * Delicious connector
 *
 * Fetches and returns interaction counts from Delicious
 */

var req = require('request');
var deferred = require('deferred');

exports.fetch = function(urls, metrics) {
	return deferred.map(urls, function(url) {
		var def = deferred();
		req.get("http://feeds.delicious.com/v2/json/urlinfo/data?url="+encodeURIComponent(url), function(err, respobj, resp) {
			try {
				resp = JSON.parse(resp);
				def.resolve({url:url, metric:'shares', count:(resp.length ? resp[0].total_posts : 0)});
			} catch (err) {
				def.resolve({});
			}
		});
		return def.promise;
	});
}

exports.getMetrics = function() {
	return ['shares'];
}
