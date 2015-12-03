/*
 * Facebook connector
 *
 * Fetches and returns interaction counts from Facebook
 */

var req = require('request');

exports.fetch = function(urls, metrics) {
	const url = 'https://graph.facebook.com/fql?q=SELECT%20url,%20like_count,%20share_count,%20click_count,%20comment_count%20FROM%20link_stat%20WHERE%20url%20IN%20("'+urls.map(encodeURIComponent).join('","')+'")'
	return new Promise((resolve, reject) => {
		req.get(url, function(err, resp, body) {
			var retdata = [];
			body = JSON.parse(body);
			if (body.error) { 
				retdata.push({error:body.error});
				resolve(retdata);
			} else {
				body.data.forEach(function(item) {
					if (metrics.indexOf('endorsements') !== -1) retdata.push({url:item.url, metric:'endorsements', count:item.like_count});
					if (metrics.indexOf('shares') !== -1) retdata.push({url:item.url, metric:'shares', count:item.share_count});
					if (metrics.indexOf('comments') !== -1) retdata.push({url:item.url, metric:'comments', count:item.comment_count});
					if (metrics.indexOf('clicks') !== -1) retdata.push({url:item.url, metric:'clicks', count:item.click_count});
				})
				resolve(retdata);
			}
		});
	})
}

exports.getMetrics = function() {
	return ['endorsements', 'shares', 'comments', 'clicks'];
}
