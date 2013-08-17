/*
 * Share (Origami service)
 *
 * Provides share counts and buttons for sharing URLs
 */

var express = require('express');

var app = express()
.use(express.static('public'))
.set('view engine', 'html')

app.all('*', function(req, res, next){
  if (!req.get('Origin')) return next();
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  if ('OPTIONS' == req.method) return res.send(200);
  next();
});

app.get('/', require('./controllers/routes/info.js'));
app.get('/v1/getCounts', require('./controllers/routes/getCounts.js'));

app.use(function(err, req, res, next) {
	if (err.stack) console.error(err.stack);
	res.send(500, err);
});

app.listen(3001);
