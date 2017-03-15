var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var _seanceSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	start: {
		type: Date,
		required: true,
		index: true
	},
	end: {
		type: Date,
		required: true,
		index: true
	},
});

var _model = mongoose.model('Seance', _seanceSchema);

var _findById = function(id, success, fail) {
	_model.findById(id, function(e, seance) {
		if (e) {
			fail(e)
		} else {
			success(seance);
		}
	});
}

var _findAll = function(success, fail) {
	_model.find({}, function(e, seances) {
		if (e) {
			fail(e)
		} else {
			success(seances);
		}
	});
}

var _addSeance = function(seance, success, fail) {
	var seanceModel = new _model();
	seanceModel.title = seance.title;
	seanceModel.start = seance.start;
	seanceModel.end = seance.end;
	seanceModel.save(function(e, seance) {
		if (e) {
			fail(e)
		} else {
			success(seance);
		}
	});
}

var _updateSeance = function(id, seance, success, fail) {
	if (id == '') {
		fail('Id should not be empty');
	} else {
		_model.findOneAndUpdate({
			_id: id
		}, seance, {
			new: true,
			runValidators: true,
		}, function(e, seance) {
			if (e) {
				fail(e)
			} else {
				success(seance);
			}
		});
	}
}

var _removeSeance = function(seance, success, fail) {
	if (seance.id == '') {
		fail('Id should not be empty');
	} else {
		_model.findOneAndRemove({
			_id: seance.id
		}, {
			new: false
		}, function(e, seance) {
			if (e) {
				fail(e)
			} else {
				success(seance);
			}
		});
	}
}

module.exports = {
	schema: _seanceSchema,
	model: _model,
	findById: _findById,
	findAll: _findAll,
	addSeance: _addSeance,
	updateSeance: _updateSeance,
	removeSeance: _removeSeance,
};