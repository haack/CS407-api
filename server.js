var express = require('express'),
	routes = require('./routes.js'),
	bodyParser = require('body-parser');

console.log("\n\nStarting server...");

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/song/:filename', routes.getSong);
app.post('/song/', routes.addSong);

app.post('/recommend/', routes.recommend);

app.get('/bareitall', routes.getDB);
app.get('/totalwipeout', routes.resetDB);

app.get('/test', routes.testGet);
app.post('/test', routes.testPost);

app.listen(1337);
console.log('Listening on port 1337...');