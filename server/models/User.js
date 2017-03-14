var mongoose = require('mongoose');
var md5 = require('md5');
var Schema = mongoose.Schema;

var _userSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true,
		index: {
			index: true
		}
	},
	password: {
		type: String,
		required: true,
		index: {
			index: true
		}
	},
	firstname: {
		type: String,
		required: true
	},
	lastname: {
		type: String,
		required: true
	},
	role: {
		type: String,
		required: true,
		default: 'user'
	}
});

var _model = mongoose.model('User', _userSchema);

var _findByEMail = function(email, success, fail) {
	_model.findOne({
		email: email
	}, function(e, user) {
		if (e) {
			fail(e)
		} else {
			success(user);
		}
	});
}

var _findById = function(id, success, fail) {
	_model.findById(id, function(e, user) {
		if (e) {
			fail(e)
		} else {
			success(user);
		}
	});
}

var _findByEMailAndPassword = function(email, password, success, fail) {
	_model.findOne({
		email: email,
		password: md5(password)
	}, function(e, user) {
		if (e) {
			fail(e)
		} else {
			success(user);
		}
	});
}

var _addUser = function(user, success, fail) {
	if (user.password == '') {
		// Test "manuel" obligatoire car le md5 d'une chaine vide n'est pas vide
		fail('Password should not be empty');
	} else {
		var userModel = new _model();
		userModel.email = user.email;
		userModel.password = md5(user.password);
		userModel.firstname = user.firstname;
		userModel.lastname = user.lastname;
		userModel.role = user.role;
		userModel.save(function(e, user) {
			if (e) {
				fail(e)
			} else {
				success(user);
			}
		});
	}
}

var _updateUser = function(id, user, success, fail) {
	if (id == '') {
		fail('Id should not be empty');
	} else if (user.password == '') {
		// Test "manuel" obligatoire car le md5 d'une chaine vide n'est pas vide
		fail('Password should not be empty');
	} else {
		_model.findOneAndUpdate({
			_id: id
		}, user, {
			new: true
		}, function(e, user) {
			if (e) {
				fail(e)
			} else {
				success(user);
			}
		});
	}
}

var _removeUser = function(user, success, fail) {
	if (user.id == '') {
		// Test "manuel" obligatoire car le md5 d'une chaine vide n'est pas vide
		fail('Id should not be empty');
	} else {
		_model.findOneAndRemove({
			_id: user.id
		}, {
			new: false
		}, function(e, user) {
			if (e) {
				fail(e)
			} else {
				success(user);
			}
		});
	}
}

var _findAll = function(success, fail) {
	_model.find({}, function(e, users) {
		if (e) {
			fail(e)
		} else {
			success(users);
		}
	});
}

var _userWithoutPassword = function(user) {
	var dbUserObj = { // spoofing a userobject from the DB. 
		id: user._id,
		email: user.email,
		firstname: user.firstname,
		lastname: user.lastname,
		role: user.role
	};
	return dbUserObj;
}

module.exports = {
	schema: _userSchema,
	model: _model,
	findByEMail: _findByEMail,
	findByEMailAndPassword: _findByEMailAndPassword,
	addUser: _addUser,
	findAll: _findAll,
	updateUser: _updateUser,
	removeUser: _removeUser,
	findById: _findById,
	userWithoutPassword: _userWithoutPassword
};