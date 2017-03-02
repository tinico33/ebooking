var mongoose    = require('mongoose');
var md5     	= require('md5');
var Schema      = mongoose.Schema;

var _userSchema   = new Schema({
    username: {type : String, required : true, index: { unique: true, required : true, index: true} },
    password: {type : String, required : true, index: { required : true, index: true } },
    firstname: {type : String, required : true, index: { required : true } },
    lastname: {type : String, required : true, index: { required : true } },
    email : {type : String, required : true, index: { unique: true, required : true } },
    role: {type : String, required : true, default: 'user', index: { required : true } },
});

var _model = mongoose.model('User', _userSchema);

var _findByUsername = function(username, success, fail) {    
	_model.findOne({username:username}, function(e, user) {      
		if(e){        
			fail(e)      
		}else{       
			success(user);      
		}    
	});
}  

var _findByUsernameAndPassword = function(username, password, success, fail) {    
	_model.findOne({username: username, password: md5(password)}, function(e, user) {      
		if(e){
			fail(e)
		}else{
			success(user);
		}
	});
} 

var _addUser = function(user, success, fail) { 
    if (user.password == '') {
    	fail('Password should not be empty');
    } else {
    	var userModel = new _model();
	    userModel.username = user.username;
	    userModel.password = md5(user.password);
	    userModel.firstname = user.firstname;
	    userModel.lastname = user.lastname;
	    userModel.email = user.email;
	    userModel.role = user.role;
	    userModel.save(function(e, user) {
			if(e){
				fail(e)
			}else{
				success(user);
			}
	    });
    }
}

var _userWithoutPassword = function(user) {
	var dbUserObj = { // spoofing a userobject from the DB. 
		username: user.username,
		firstname: user.firstname,
		lastname: user.lastname,
		email: user.email,
		role: user.role
    };
    return dbUserObj;
}

module.exports = {
	schema : _userSchema,    
	model : _model,    
	findByUsername : _findByUsername,
	findByUsernameAndPassword : _findByUsernameAndPassword,
	addUser : _addUser,
	userWithoutPassword : _userWithoutPassword
};