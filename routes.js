mongojs = require("mongojs");

//connect to db with access to specified collections
db = mongojs.connect("fluctus", ["featuredata", "minmax"]);

exports.getSong = function(req, res) {
	console.log("/GET on " + req.originalUrl);

	//get requested filename
	var file = req.params.filename;
	console.log("Requesting: " + file);

	db.featuredata.findOne({"name": file}, function(err, docs) {
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
	
	//get features sent
	features = req.body.features;

	db.featuredata.insert(req.body, function(err, result) {
		if (!err) {
			res.send({'result': 'success'});
		} else {
			res.send({'result': 'error'});
		}
	});


	//update tracked min and max values
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
	console.log("Requested epsilon: " + epsilon);
	console.log("Clusters recieved: " + JSON.stringify(clusters));

	//get all feature data
	db.featuredata.find(function(err, docs) {
		//get all minmax for normalisation
		db.minmax.find(function(err, minmax) {
			if (docs.length > 0) { 
				//get all songs that can be recommended (anything not sent by user)
				targetSongs = getTargetSongs(docs, clusters);

				//filter out unclustered songs
				filterClusters(clusters, -1);

				//fetch the feature data for songs sent by user
				clusterSongs = getClusterSongs(docs, clusters);

				if((targetSongs.length == 0) || (clusters.length == 0)) {
					//implies user library encompasses the db
					console.log("No possible recommendations");
					res.send({"result": "No possible recommendations"});
					return;
				}

				//will store recommendations
				var recs = [];

				//check each possible recommendation
				for(var i in targetSongs) {
					//will store the number of user's songs that are similar
					var count = 0;

					//compare with each user song
					for(j in clusters) {
						//if normalised euclidean distance is less than epsilon
						if(normalisedEuclidean(targetSongs[i], clusterSongs[j], minmax) <= epsilon) {
							count++;
						}
					}

					//update top 10 recs
					if(((count > 0) && (recs.length < 10)) || ((recs.length > 10) && (count > recs[10].count))) {
						recs.push({"name": targetSongs[i].name, "count": count});
						recs.sort(function(a, b) {return a.count - b.count});

						//if more than 10 recs
						if(recs.legth > 10){
							recs.pop();
						}
					}
				}

				//no songs within epsilon
				if(recs.length == 0){
					console.log("No similar songs");
					res.send({"result": "No similar songs"});
					return;
				}
				else { //return recommendations
					console.log(recs.length);
					res.send({"result": "success", data: recs});
					return;
				}
			}
		});
	});
};

//return maximum and minimum for every feature
exports.getMinMax = function(req, res) {
	console.log("/POST on " + req.originalUrl);

	console.log("Generating recommendations...");

	db.minmax.find(function(err, docs) {
		res.send(docs);
	});
};

//normalise feature value
normalise = function(feature, minmax) {
	//find relevant minmax in array
	for (i in minmax) {
		if (minmax[i].name == feature.name) {
			break;
		}
	}
	return (feature.value - minmax[i].min) / (minmax[i].max - minmax[i].min);
};

//remove items from clusters that match label
filterClusters = function(clusters, label) {
	for (i = 0; i < clusters.length; i++) {
		if (clusters[i].label == label) {
			clusters.splice(i, 1);
			i--;
		}
	}
};

//get song objects (containing feature data) from all if they are in user library
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