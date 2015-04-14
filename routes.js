exports.song = function(req, res, next) {
	console.log("/GET on " + req.originalUrl);

    var file = req.params.filename;
	console.log("Requesting: " + file);

	if (file == "joe") { //been there done that
		res.send({
			'seen': true, 
			'featurex': 3,
			'featurey': 1,
			'featurez': 4
		});
	} else { //song not seen before
		res.send({'seen': false});
	}
};

exports.addSong = function(req, res) {
	console.log("/POST on " + req.originalUrl);
	
	console.log("Adding song: " + req.body.name);
	console.log("Features: " + JSON.stringify(req.body.features));
	
	res.send({'result': 'success'});
};

exports.testGet = function(req, res) {
	console.log("/GET on /test");
	res.send({'Yay':'This GET has gone swimmingly'});
};

exports.testPost = function(req, res) {
	console.log("/POST on /test");
	res.send({'Yay':'This POST has gone swimmingly'});
};