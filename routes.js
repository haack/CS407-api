mongojs = require("mongojs");

db = mongojs.connect("fluctus", ["featuredata"]);

exports.song = function(req, res) {
	console.log("/GET on " + req.originalUrl);

    var file = req.params.filename;
	console.log("Requesting: " + file);

	db.featuredata.findOne({"name": file}, function(err, docs) {
	    // docs is an array of all the documents in mycollection 
	    console.log(docs);
	    if (docs) {
	    	docs.seen = true;
	    	res.send(docs);
	    } else {
	    	res.send({"seen": false});
	    }
	});
};

exports.addSong = function(req, res) {
	console.log("/POST on " + req.originalUrl);
	
	console.log("Adding song: " + req.body.name);
	console.log("Features: " + JSON.stringify(req.body.features));

	db.featuredata.insert(req.body, function(err, result) {
		if (!err) {
			res.send({'result': 'success'});
		} else {
			res.send({'result': 'error'});
		}
	});
};

exports.recommend = function(req, res) {
	console.log("/POST on " + req.originalUrl);

	console.log("Generating recommendations...");

	res.send({"recs": [
			{"name": "Dark_side_of_the_moon"},
			{"name": "Kitchen_sink"}
		]});
};

exports.testGet = function(req, res) {
	console.log("/GET on /test");
	res.send({'Yay':'This GET has gone swimmingly'});
};

exports.testPost = function(req, res) {
	console.log("/POST on /test");
	res.send({'Yay':'This POST has gone swimmingly'});
};