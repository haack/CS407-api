var express = require('express'),
	routes = require('./routes.js'),
	bodyParser = require('body-parser');

console.log("\n\nStarting server...");

var app = express();

port = 1337;

//set data decoder
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

///////////////////
//
//	URL ROUTES
//
//	See spec.md for documentation on how to use these routes
//
///////////////////
app.get('/song/:filename', routes.getSong);
app.post('/song/', routes.addSong);
app.get('/minmax/', routes.getMinMax);

app.post('/recommend/', routes.recommend);

//temporary routes used for development
app.get('/showDB', routes.getDB);
app.get('/resetDB', routes.resetDB);

//test routes allow you to check if API is working before making changes
app.get('/test', routes.testGet);
app.post('/test', routes.testPost);

//
app.listen(port);
console.log('Listening on port ' + port + '...');