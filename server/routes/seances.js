var Seance = require('../models/Seance');

var seances = {

  getAll: function(req, res) {
    Seance.findAll(function(seances) {
      res.status(200);
      res.json(seances);
    }, function(error) {
      res.status(500);
      res.json({
        status: 500,
        message: "Error occured: " + error
      });
    });
  },

  getOne: function(req, res) {
    var id = req.params.id;
    Seance.findById(id, function(seance) {
      res.status(200);
      res.json(seance);
    }, function(error) {
      res.status(500);
      res.json({
        status: 500,
        message: "Error occured: " + error
      });
    });
  },

  create: function(req, res) {
    Seance.addSeance({
      title: req.body.title,
      start: req.body.start,
      end: req.body.end,
    }, function(seance) {
      res.status(200);
      res.json(seance);
    }, function(error) {
      res.status(500);
      res.json({
        status: 500,
        message: "Error occured: " + error
      });
    });
  },

  update: function(req, res) {
    var id = req.params.id;
    Seance.updateSeance(id, {
      title: req.body.title,
      start: req.body.start,
      end: req.body.end,
    }, function(seance) {
      res.status(200);
      res.json(seance);
    }, function(error) {
      res.status(500);
      res.json({
        status: 500,
        message: "Error occured: " + error
      });
    });
  },

  delete: function(req, res) {
    var id = req.params.id;
    Seance.removeSeance({
      id: id
    }, function(seance) {
      res.status(200);
      res.json(seance);
    }, function(error) {
      res.status(500);
      res.json({
        status: 500,
        message: "Error occured: " + error
      });
    });
  }
}

module.exports = seances;