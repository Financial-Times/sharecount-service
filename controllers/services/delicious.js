/*
 * Delicious connector
 *
 * Fetches and returns interaction counts from Delicious
 */

var req = require('request');
var deferred = require('deferred');

exports.fetch = function(urls, metrics) {
	if (metrics.indexOf('shares') === -1) {
		var def = deferred();
		def.resolve(null);
		return def.promise;
	}
	return deferred.map(urls, function(url) {
		var def = deferred();
		req.get("http://feeds.delicious.com/v2/json/urlinfo/data?url="+encodeURIComponent(url), function(err, respobj, resp) {
			resp = JSON.parse(resp);
			def.resolve({url:url, metric:'shares', count:(resp.length ? resp[0].total_posts : 0)});
		});
		return def.promise;
	});
}
