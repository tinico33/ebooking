var express = require('express');
var router = express.Router();

var auth = require('./auth.js');
var seances = require('./seances.js');
var user = require('./users.js');

/*
 * Routes that can be accessed by any one
 */
router.post('/signin', auth.signin);
router.post('/signup', auth.signup);

/*
 * Routes that can be accessed only by authenticated & authorized users
 */
router.get('/api/v1/admin/users', user.getAll);
router.get('/api/v1/admin/user/:id', user.getOne);
router.post('/api/v1/admin/user/', user.create);
router.put('/api/v1/admin/user/:id', user.update);
router.delete('/api/v1/admin/user/:id', user.delete);

/*
 * Routes that can be accessed only by autheticated users
 */
router.get('/api/v1/admin/seances', seances.getAll);
router.get('/api/v1/admin/seance/:id', seances.getOne);
router.post('/api/v1/admin/seance/', seances.create);
router.put('/api/v1/admin/seance/:id', seances.update);
router.delete('/api/v1/admin/seance/:id', seances.delete);

module.exports = router;