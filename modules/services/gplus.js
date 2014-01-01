var req = require('request');
var deferred = require('deferred');

exports.fetch = function(urls, metrics) {
	return deferred.map(urls, function(url) {
		var def = deferred();
		req.get("https://plusone.google.com/_/+1/fastbutton?url="+encodeURIComponent(url)+"&count=true", function(err, respobj, resp) {
			var count = resp.replace(/^[\s\S]*? \{c\:\s*(\d+)[\s\S]+$/, '$1');
			def.resolve({url:url, metric:'endorsements', count:(!isNaN(count) ? parseInt(count,10) : 0)});
		});
		return def.promise;
	});
}
exports.getMetrics = function() {
	return ['endorsements'];
}
