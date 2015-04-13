var express = require('express'),
	routes = require('./routes.js');

console.log("Starting server...");
var app = express();

app.get('/test', routes.test);

app.listen(1337);
console.log('Listening on port 1337...');