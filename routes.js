mongojs = require("mongojs");

db = mongojs.connect("fluctus", ["featuredata", "minmax"]);

exports.getSong = function(req, res) {
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
	features = req.body.features;
	console.log("Features: " + features);

	db.featuredata.insert(req.body, function(err, result) {
		if (!err) {
			res.send({'result': 'success'});
		} else {
			res.send({'result': 'error'});
		}
	});

	for (i = 0; i < features.length; i++) {
		(function(j) {
			db.minmax.find({"name": features[j].name}, function(err, result) {
				if (result != "") {
					result = result[0];
					if (features[j].value < result.min) {
						db.minmax.update({"name": features[j].name}, {$set: {"min": features[j].value}});
					} else if (features[j].value > result.max) {
						db.minmax.update({"name": features[j].name}, {$set: {"max": features[j].value}});
					}
				} else {
					db.minmax.insert({"name": features[j].name, "min": features[j].value, "max": features[j].value}, function(err, none) {});
				}
			});
		})(i);
	}
};

exports.recommend = function(req, res) {
	console.log("/POST on " + req.originalUrl);

	console.log("Generating recommendations...");

	clusters = req.body.clusters;
	epsilon = req.body.epsilon;
	console.log(epsilon);
	console.log(JSON.stringify(clusters));

	db.featuredata.find(function(err, docs) {
		db.minmax.find(function(err, minmax) {
			if (docs.length > 0) { 
				targetSongs = getTargetSongs(docs, clusters);

				filterClusters(clusters, -1);

				clusterSongs = getClusterSongs(docs, clusters);

				if(targetSongs.length == 0) {
					res.send({"result": "No possible recommendations"});
				}

				var recs = [];

				for(var i in targetSongs) {
					var count = 0;

					for(j in clusters) {
						if(normalisedEuclidean(targetSongs[i], clusterSongs[j], minmax) <= epsilon) {
							count++;
						}
					}

					if(((count > 0) && (recs.length < 10)) || ((recs.length > 10) && (count > recs[10].count))) {
						recs.push({"name": targetSongs[i].name, "count": count});
						recs.sort(function(a, b) {return a.count - b.count});

						if(recs.legth > 10){
							recs.pop();
						}
					}
				}

				if(recs.length == 0){
					res.send({"Result": "No similar songs"});
				}
				else {
					console.log(recs.length);
					res.send(recs);
				}
			}
		});
	});
};

exports.getMinMax = function(req, res) {
	console.log("/POST on " + req.originalUrl);

	console.log("Generating recommendations...");

	db.minmax.find(function(err, docs) {
		res.send(docs);
	});
};

normalise = function(feature, minmax) {
	for (i in minmax) {
		if (minmax[i].name == feature.name) {
			break;
		}
	}
	return (feature.value - minmax[i].min) / (minmax[i].max - minmax[i].min);
};

filterClusters = function(clusters, label) {
	for (i = 0; i < clusters.length; i++) {
		if (clusters[i].label == label) {
			clusters.splice(i, 1);
			i--;
		}
	}
};

getClusterSongs = function(all, clusters) {
	var clusterSongs = [];
	for (i in clusters) {
		for (j in all) {
			if (all[j].name == clusters[i].name) {
				clusterSongs.push(all[j]);
				break;
			}
		}
	}
	return clusterSongs;
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
};

normalisedEuclidean = function(s1,s2, minmax) {
	var sum = 0;

	for(var i in s1.features) {
		var temp = Math.abs(normalise(s1.features[i], minmax) - normalise(s2.features[i], minmax));
		sum += temp*temp;
	}

	return Math.sqrt(sum);
};

exports.testGet = function(req, res) {
	console.log("/GET on /test");
	res.send({'Yay':'This GET has gone swimmingly'});
};

exports.testPost = function(req, res) {
	console.log("/POST on /test");
	res.send({'Yay':'This POST has gone swimmingly'});
};

exports.resetDB = function(req, res) {
	db.featuredata.remove({}, function(err, result) {
		db.minmax.remove({}, function(err, result) {
			res.send({"Result": "All gone"});
		});
	});
};

exports.getDB = function(req, res) {
	db.featuredata.find(function(err, result) {
		res.send(result);
	});
};