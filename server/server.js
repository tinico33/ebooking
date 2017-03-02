var express     = require('express');
var path        = require('path');
var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');

var app = express();

app.use(bodyParser.json());

console.log('process.env.MONGO_URL : '+process.env.MONGO_URL);

var mongodbUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/booking';

mongoose.connect(mongodbUrl);

app.all('/*', function(req, res, next) {
  // CORS headers
  res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  // Set custom headers for CORS
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token');
  if (req.method == 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});
 
// Auth Middleware - This will check if the token is valid
// Only the requests that start with /api/v1/* will be checked for the token.
// Any URL's that do not follow the below pattern should be avoided unless you 
// are sure that authentication is not needed
app.all('/api/v1/*', [require('./middlewares/validateRequest')]);
 
app.use('/', require('./routes'));
 
// If no route is matched by now, it must be a 404
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
 
// Start the server
app.set('port', process.env.PORT || 3000);
 
var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

// If the Node process ends, close the Mongoose connection 
server.on('close', function() {
  mongoose.connection.close();
}); 

module.exports = server;