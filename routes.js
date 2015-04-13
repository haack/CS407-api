exports.song = function(req, res, next) {
    var file = req.params.filename;
	console.log("Requesting: " + file);

	res.send({'File': file});
};

exports.testGet = function(req, res, next) {
	console.log("/GET on /test");
	res.send({'Yay':'This GET has gone swimmingly'});
};

exports.testPost = function(req, res, next) {
	console.log("/POST on /test");
	res.send({'Yay':'This POST has gone swimmingly'});
};