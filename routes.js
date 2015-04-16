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
			distance(req.body, null);
		} else {
			res.send({'result': 'error'});
		}
	});
};

exports.recommend = function(req, res) {
	console.log("/POST on " + req.originalUrl);

	console.log("Generating recommendations...");

	clusters = req.body;
	//TODO fetch feature data for each song
	epsilon = 5;
	//TODO send from client

	db.featuredata.find(function(err, docs) {
		targetSongs = getTargetSongs(docs, clusters);

		if(targetSongs.length == 0) {
			return "No recommendations available";
		}

		var recs = [];
		
		for(var i in targetSongs) {
			var count = 0;

			for(j in clusters) {
				if(euclidean(targetSongs[i], clusters[j]) <= epsilon) {
					count++;
				}
			}

			if(((count > 0) && (recs.length < 10)) || ((recs.length > 10) && (count > recs[10].count))) {
				recs.push({"song":targetSongs[i],"count":count});
				recs.sort(function(a, b){return a.count - b.count});

				if(recs.legth > 10){
					recs.pop();
				}
			}
		}

		if(recs.length == 0){
			res.send({"Result": "No recommendations available"});
		}
		else {
			console.log(recs.length);
			res.send(recs);
		}
	});
};

getTargetSongs = function(all, user) {
	var targetSongs = [];
	for (i in all) {
		var match = false;
		for (j in user) {
			if (all[i].name == user[j].name) {
				match = true;
				break;
			}
		}
		if (!match) {
			targetSongs.push(all[i]);
		}
	}
	return targetSongs;
}

euclidean = function(s1,s2) {
	var sum = 0;
	for(var i in s1.features) {
		var temp = Math.abs(s1.features[i].value - s2.features[i].value);
		sum += temp*temp;
	}

	return Math.sqrt(sum);
}

exports.testGet = function(req, res) {
	console.log("/GET on /test");
	res.send({'Yay':'This GET has gone swimmingly'});
};

exports.testPost = function(req, res) {
	console.log("/POST on /test");
	res.send({'Yay':'This POST has gone swimmingly'});
};