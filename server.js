var express = require('express'),
	routes = require('./routes.js');

console.log("Starting server...");
var app = express();

app.get('/song/:filename', routes.song);
app.post('/song/', routes.addSong);

app.get('/test', routes.testGet);
app.post('/test', routes.testPost);

app.listen(1337);
console.log('Listening on port 1337...');